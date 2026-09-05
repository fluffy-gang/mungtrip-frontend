import { TripWriteUncertainError } from './api';
import { TripSessionChangedError } from './provider';
import { positions, positive } from './validation';

import type { TripCreateInput, TripFlowInput, TripFlowResult, TripProvider } from './types';
export interface TripFlowSubmit {
  create?: TripCreateInput;
  tripId?: number;
  day?: number;
}
/** Retains confirmed creation across add failures, with one in-flight submission. */
export function createTripFlowController(provider: TripProvider, input: TripFlowInput) {
  const session = provider.getSnapshot().sessionRevision;
  let createdTripId: number | undefined;
  let pending: Promise<TripFlowResult> | undefined;
  let terminal: TripFlowResult | undefined;
  let uncertain = false;
  let targetId: number | undefined;
  let targetDay: number | undefined;
  const check = () => {
    if (provider.source !== input.source)
      throw new Error('데이터 출처가 일치하지 않습니다.');
    if (session !== provider.getSnapshot().sessionRevision)
      throw new TripSessionChangedError();
  };
  return {
    get createdTripId() { return createdTripId; },
    get busy() { return !!pending; },
    get uncertain() { return uncertain; },
    submit(values: TripFlowSubmit): Promise<TripFlowResult> {
      if (pending)
        return pending;
      if (terminal)
        return Promise.resolve(terminal);
      const operation = async (): Promise<TripFlowResult> => {
        check();
        if (uncertain)
          throw new TripWriteUncertainError();
        if (!createdTripId && values.create)
          createdTripId = await provider.create(values.create);
        check();
        targetId = createdTripId ?? values.tripId ?? input.tripId;
        targetDay = values.day ?? input.day ?? 1;
        if (!targetId)
          throw new Error('여행을 선택해 주세요.');
        positive(targetDay);
        let tripItemIds: number[] = [];
        if (input.selection?.kind === 'place')
          tripItemIds = await provider.addPlaces(targetId, input.selection.places.map(place => place.id), targetDay);
        if (input.selection?.kind === 'course')
          tripItemIds = await provider.addCourse(targetId, input.selection.courseId, targetDay);
        check();
        terminal = { status: 'completed', source: input.source, tripId: targetId, tripItemIds };
        return terminal;
      };
      pending = operation().catch(error => {
        if (error instanceof TripWriteUncertainError)
          uncertain = true; throw error;
      }).finally(() => { pending = undefined; });
      return pending;
    },
    cancel(): TripFlowResult | undefined {
      if (pending || terminal)
        return undefined;
      terminal = { status: 'cancelled', source: input.source, ...(createdTripId ? { createdTripId } : {}) };
      return terminal;
    },
  };
}
/** Add first, then remove the rejected item. A failed removal retries only complete PUT. */
export function createReplacementController(provider: TripProvider, tripId: number, oldItemId: number) {
  const session = provider.getSnapshot().sessionRevision;
  let addedIds: number[] = [];
  let selectedId: number | undefined;
  let pending: Promise<void> | undefined;
  let completed = false, uncertain = false;
  const check = () => {
    if (session !== provider.getSnapshot().sessionRevision)
      throw new TripSessionChangedError();
  };
  return {
    get partial() { return addedIds.length > 0 && !completed; },
    get busy() { return !!pending; },
    get uncertain() { return uncertain; },
    submit(placeId: number): Promise<void> {
      if (pending)
        return pending;
      if (completed)
        return Promise.resolve();
      const operation = async () => {
        check();
        if (uncertain)
          throw new TripWriteUncertainError();
        if (selectedId !== undefined && selectedId !== placeId)
          throw new Error('이미 추가한 대체 장소의 정리를 먼저 완료해 주세요.');
        if (!addedIds.length) {
          const before = await provider.loadTrip(tripId);
          check();
          const day = before.days.find(value => value.items.some(item => item.tripItemId === oldItemId));
          if (!day)
            throw new Error('대체할 장소가 이미 변경되었습니다.');
          selectedId = placeId;
          try {
            addedIds = await provider.addPlaces(tripId, [placeId], day.day);
          }
          catch (error) {
            if (!(error instanceof TripWriteUncertainError))
              selectedId = undefined;
            throw error;
          }
          check();
        }
        const latest = await provider.loadTrip(tripId);
        check();
        const all = positions(latest);
        if (!addedIds.every(id => all.some(item => item.tripItemId === id)))
          throw new Error('추가한 장소가 변경되었습니다. 최신 일정을 확인해 주세요.');
        if (!all.some(item => item.tripItemId === oldItemId)) {
          completed = true;
          return;
        }
        const items = latest.days.flatMap(day => day.items.filter(item => item.tripItemId !== oldItemId).map((item, index) => ({ tripItemId: item.tripItemId, day: day.day, sortOrder: index + 1 })));
        await provider.update(tripId, { baseline: latest, title: latest.title, items });
        check();
        completed = true;
      };
      pending = operation().catch(error => {
        // PUT is idempotent and the next retry reloads before constructing its payload.
        if (error instanceof TripWriteUncertainError && !addedIds.length)
          uncertain = true;
        throw error;
      }).finally(() => { pending = undefined; });
      return pending;
    },
  };
}
/** Do not apply a callback that was opened under another account/session. */
export async function completeTripVisit(provider: TripProvider, action: import('./types').TripVisitAction, visit: (action: import('./types').TripVisitAction) => Promise<import('./types').TripVisitResult>) {
  const session = provider.getSnapshot().sessionRevision;
  if (provider.source !== action.source)
    throw new Error('데이터 출처가 일치하지 않습니다.');
  const result = await visit(action);
  if (provider.getSnapshot().sessionRevision !== session)
    throw new TripSessionChangedError();
  await provider.applyVisitResult(result);
  if (provider.getSnapshot().sessionRevision !== session)
    throw new TripSessionChangedError();
  return result;
}
