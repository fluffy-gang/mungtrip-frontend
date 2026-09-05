import { createTripAdapter } from './api';
import { createMockAdapter } from './mock';
import { editFingerprint, parseTrip, positive, titleValue, validateCreate, validatePositions } from './validation';

import type { MockScenario, Trip, TripProvider, TripProviderOptions, TripSnapshot, TripTransport } from './types';
export class TripSessionChangedError extends Error {
  constructor() { super('로그인 상태가 변경되었습니다. 다시 열어 주세요.'); this.name = 'TripSessionChangedError'; }
}
export const errorMessage = (error: unknown): string => error instanceof Error ? error.message : '요청을 처리하지 못했어요.';
const immutable = <T>(value: T): T => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(immutable);
    Object.freeze(value);
  }
  return value;
};
const defaultTransport: TripTransport = {
  request: async ({ method, path, body, params }) => {
    const { apiClient } = await import('@/shared/api/client');
    return (await apiClient.request<unknown>({ method, url: path, data: body, params })).data;
  },
};
/** Reads are generation-guarded; complete writes are serialized and compare their baseline. */
export function createTripProvider(options: TripProviderOptions = {}): TripProvider {
  const source = options.source ?? 'real';
  let mockScenario: MockScenario = options.mock?.scenario ?? 'populated';
  const mock = source === 'mock' ? createMockAdapter(mockScenario, options.mock?.today) : undefined;
  const adapter = mock?.adapter ?? createTripAdapter(options.transport ?? defaultTransport);
  let epoch = 0, readVersion = 0, optionsVersion = 0;
  let sessionKey: string | undefined;
  let queue: Promise<unknown> = Promise.resolve();
  const detailVersions = new Map<number, number>();
  const listeners = new Set<() => void>();
  const initial = (): TripSnapshot => ({ source, sessionRevision: epoch, revision: 0, status: 'idle', loaded: false, error: null, upcomingTrips: [], pastTrips: [], details: {}, brief: [], dogs: [] });
  let snapshot = immutable(initial());
  const publish = (patch: Partial<TripSnapshot>) => {
    snapshot = immutable({ ...snapshot, ...patch, revision: snapshot.revision + 1 });
    listeners.forEach(listener => listener());
  };
  const assertEpoch = (expected: number) => {
    if (epoch !== expected)
      throw new TripSessionChangedError();
  };
  const refresh = async () => {
    const expected = epoch, version = ++readVersion;
    publish({ status: 'loading', error: null });
    try {
      const result = await adapter.list();
      assertEpoch(expected);
      if (version === readVersion)
        publish({ ...result, status: 'ready', loaded: true });
    }
    catch (error) {
      if (expected === epoch && version === readVersion)
        publish({ status: 'error', error: errorMessage(error) });
      throw error;
    }
  };
  const loadTrip = async (id: number): Promise<Trip> => {
    positive(id);
    const expected = epoch, version = (detailVersions.get(id) ?? 0) + 1;
    detailVersions.set(id, version);
    const trip = parseTrip(await adapter.detail(id));
    assertEpoch(expected);
    if (detailVersions.get(id) === version)
      publish({ details: { ...snapshot.details, [id]: trip } });
    return trip;
  };
  const refreshOptions = async () => {
    const expected = epoch, version = ++optionsVersion;
    const [brief, dogs] = await Promise.all([adapter.brief(), adapter.dogs()]);
    assertEpoch(expected);
    if (version === optionsVersion)
      publish({ brief, dogs });
  };
  const invalidateReads = () => {
    readVersion++;
    optionsVersion++;
    detailVersions.forEach((version, id) => detailVersions.set(id, version + 1));
  };
  const enqueue = <T>(operation: (expected: number) => Promise<T>): Promise<T> => {
    const expected = epoch;
    const result = queue.catch(() => undefined).then(async () => {
      assertEpoch(expected);
      invalidateReads();
      const value = await operation(expected);
      assertEpoch(expected);
      return value;
    });
    queue = result.catch(() => undefined);
    return result;
  };
  // A confirmed write stays successful when a subsequent GET fails.
  const afterWrite = async (expected: number, id?: number) => {
    assertEpoch(expected);
    invalidateReads();
    const results = await Promise.allSettled([refresh(), refreshOptions(), ...(id === undefined ? [] : [loadTrip(id)])]);
    assertEpoch(expected);
    const failed = results.find(result => result.status === 'rejected');
    if (failed?.status === 'rejected')
      publish({ error: `저장했지만 최신 정보를 불러오지 못했어요. ${errorMessage(failed.reason)}` });
  };
  const guardRead = async <T>(read: () => Promise<T>): Promise<T> => {
    const expected = epoch;
    const value = await read();
    assertEpoch(expected);
    return value;
  };
  const provider: TripProvider = {
    source, getSnapshot: () => snapshot,
    subscribe: listener => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    refresh, refreshOptions, getTrip: id => snapshot.details[id], loadTrip,
    resetForSession: key => {
      if (key !== undefined && key === sessionKey)
        return;
      sessionKey = key;
      epoch++;
      invalidateReads();
      queue = Promise.resolve();
      mock?.reset(mockScenario);
      snapshot = immutable(initial());
      listeners.forEach(listener => listener());
    },
    create: input => enqueue(async (expected) => {
      const id = await adapter.create(validateCreate(input));
      assertEpoch(expected);
      await afterWrite(expected, id);
      return id;
    }),
    addPlaces: (id, ids, day) => enqueue(async (expected) => {
      const trip = await adapter.detail(id);
      assertEpoch(expected);
      if (!trip.days.some(value => value.day === day))
        throw new Error('선택한 일차가 없습니다.');
      const result = await adapter.addPlaces(id, ids, day);
      assertEpoch(expected);
      await afterWrite(expected, id);
      return result;
    }),
    addCourse: (id, courseId, day) => enqueue(async (expected) => {
      const trip = await adapter.detail(id);
      assertEpoch(expected);
      if (!trip.days.some(value => value.day === day))
        throw new Error('선택한 일차가 없습니다.');
      const result = await adapter.addCourse(id, courseId, day);
      assertEpoch(expected);
      await afterWrite(expected, id);
      return result;
    }),
    update: (id, draft) => enqueue(async (expected) => {
      const baseline = parseTrip(draft.baseline);
      if (baseline.tripId !== id)
        throw new Error('여행이 일치하지 않습니다.');
      validatePositions(baseline, draft.items);
      titleValue(draft.title);
      const latest = parseTrip(await adapter.detail(id));
      assertEpoch(expected);
      if (editFingerprint(latest) !== editFingerprint(baseline)) {
        publish({ details: { ...snapshot.details, [id]: latest } });
        throw new Error('다른 변경사항이 있어요. 최신 일정을 불러온 뒤 다시 편집해 주세요.');
      }
      await adapter.update(id, draft.title, draft.items);
      assertEpoch(expected);
      await afterWrite(expected, id);
    }),
    remove: id => enqueue(async (expected) => {
      await adapter.remove(id);
      assertEpoch(expected);
      const details = { ...snapshot.details };
      delete details[id];
      publish({ details, upcomingTrips: snapshot.upcomingTrips.filter(trip => trip.tripId !== id), pastTrips: snapshot.pastTrips.filter(trip => trip.tripId !== id), brief: snapshot.brief.filter(trip => trip.tripId !== id) });
      await afterWrite(expected);
    }),
    search: params => guardRead(() => adapter.search(params)),
    recommendations: category => guardRead(() => adapter.recommendations(category)),
    recent: category => guardRead(() => adapter.recent(category)),
    nearby: id => guardRead(() => adapter.nearby(id)),
    place: id => guardRead(() => adapter.place(id)),
    applyVisitResult: result => enqueue(async (expected) => {
      if (result.status === 'cancelled')
        return;
      if (result.source !== source)
        throw new Error('데이터 출처가 일치하지 않습니다.');
      mock?.applyVisit(result);
      const ids = Object.keys(snapshot.details).map(Number);
      const results = await Promise.allSettled([refresh(), ...ids.map(loadTrip)]);
      assertEpoch(expected);
      const failed = results.find(value => value.status === 'rejected');
      if (failed?.status === 'rejected')
        throw failed.reason;
    }),
  };
  if (mock) {
    provider.resetFixture = (scenario = 'populated') => { mockScenario = scenario; provider.resetForSession(); };
    provider.failNext = mock.failNext;
  }
  return provider;
}
export const createMockTripProvider = (scenario: MockScenario = 'populated'): TripProvider => createTripProvider({ source: 'mock', mock: { scenario } });
export const defaultTripProvider = createTripProvider();
