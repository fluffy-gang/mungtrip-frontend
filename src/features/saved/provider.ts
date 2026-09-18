import { useAuthStore } from '@/features/auth/authStore';
import { createRealSavedAdapter } from './api';
import { createMockSavedAdapter } from './mock';

import type { Course } from '@/features/courses/types';
import type { Place } from '@/features/places/types';
import type { SavedListState, SavedProvider, SavedProviderOptions, SavedSnapshot } from './types';

type SavedItem = { id: number; isLiked: boolean };
type Page<T> = { items: T[]; page: number; size: number; totalCount: number };
const emptyList = <T>(): SavedListState<T> => ({
  items: [], loaded: false, status: 'idle', error: null, page: 0, hasMore: false, totalCount: 0,
});
const expired = () => new Error('세션이 변경되어 저장 요청을 취소했습니다.');

/** A completed mutation wins reads that began before it; later reads reconcile external changes. */
function createListState<T extends SavedItem>(
  read: (page: number) => Promise<Page<T>>,
  mutate: (id: number) => Promise<{ liked: boolean }>,
  revision: () => number,
  emit: () => void,
) {
  let list = emptyList<T>();
  let liked: Record<number, boolean | undefined> = {};
  let busy = new Set<number>();
  let requestId = 0;
  let clock = 0;
  let disposed = false;
  let reconciliationNeeded = false;
  const mutations = new Map<number, { sequence: number; liked: boolean; model?: T }>();
  const valid = (session: number) => !disposed && revision() === session;

  const refresh = async (): Promise<boolean> => {
    if (disposed) return false;
    const session = revision();
    const request = ++requestId;
    const started = clock;
    list = { ...list, status: list.loaded ? 'refreshing' : 'loading', error: null };
    emit();
    try {
      const all = new Map<number, T>();
      let expectedTotal: number | undefined;
      let lastPage = 0;
      for (let page = 0; ; page += 1) {
        if (!valid(session) || request !== requestId) return false;
        // TODO(#26): Replace catalog scanning when a dedicated saved-course endpoint exists.
        if (page >= 100) throw new Error('목록이 너무 큽니다. 잠시 후 다시 시도해 주세요.');
        const result = await read(page);
        if (!valid(session) || request !== requestId) return false;
        if (result.page !== page || result.size <= 0 || result.items.length > result.size ||
            expectedTotal !== undefined && result.totalCount !== expectedTotal) {
          throw new Error('목록이 변경되었습니다. 다시 불러와 주세요.');
        }
        expectedTotal = result.totalCount;
        lastPage = page;
        for (const item of result.items) {
          if (all.has(item.id)) throw new Error('목록에 중복된 항목이 있습니다. 다시 불러와 주세요.');
          all.set(item.id, item);
        }
        if (all.size > expectedTotal) throw new Error('목록 개수가 올바르지 않습니다.');
        if (all.size === expectedTotal) break;
        if (!result.items.length) throw new Error('목록을 끝까지 불러오지 못했습니다.');
      }
      const nextLiked: Record<number, boolean | undefined> = {};
      for (const id of Object.keys(liked)) nextLiked[Number(id)] = false;
      for (const item of all.values()) nextLiked[item.id] = item.isLiked;
      for (const [id, change] of mutations) {
        if (change.sequence > started) {
          nextLiked[id] = change.liked;
          if (!change.liked) all.delete(id);
          else if (change.model) all.set(id, { ...change.model, isLiked: true });
        }
      }
      liked = nextLiked;
      const items = [...all.values()].filter(item => liked[item.id] === true);
      list = { items, loaded: true, status: 'idle', error: null, page: lastPage, totalCount: items.length, hasMore: false };
      reconciliationNeeded = false;
      emit();
      return true;
    } catch (error) {
      if (valid(session) && request === requestId) {
        list = { ...list, loaded: true, status: 'error', error: error instanceof Error ? error.message : '저장 목록을 불러오지 못했습니다.' };
        emit();
      }
      return false;
    }
  };

  const toggle = async (id: number) => {
    if (disposed) throw expired();
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error('유효하지 않은 ID입니다.');
    if (busy.has(id)) throw new Error('이미 처리 중입니다.');
    const session = revision();
    busy.add(id);
    emit();
    try {
      if (reconciliationNeeded) {
        const reconciled = await refresh();
        if (!valid(session)) throw expired();
        // An uncertain POST is a toggle, so never replay the old intent automatically.
        if (!reconciled) throw new Error('저장 상태를 확인한 뒤 다시 시도해 주세요.');
        throw new Error('저장 상태를 갱신했습니다. 현재 상태를 확인해 주세요.');
      }
      let result: { liked: boolean };
      try {
        result = await mutate(id);
      } catch (error) {
        if (!valid(session)) throw expired();
        reconciliationNeeded = true;
        await refresh();
        if (!valid(session)) throw expired();
        throw error;
      }
      if (!valid(session)) throw expired();
      const model = list.items.find(item => item.id === id);
      mutations.set(id, { sequence: ++clock, liked: result.liked, model });
      liked = { ...liked, [id]: result.liked };
      const items = result.liked ? list.items : list.items.filter(item => item.id !== id);
      list = { ...list, items, totalCount: items.length };
      emit();
      if (result.liked && !model) await refresh();
      if (!valid(session)) throw expired();
      return result;
    } finally {
      if (valid(session)) {
        busy.delete(id);
        emit();
      }
    }
  };

  return {
    refresh, toggle,
    get: () => ({ list, liked, busy: [...busy] }),
    reset: () => {
      requestId += 1;
      list = emptyList<T>();
      liked = {};
      busy = new Set();
      mutations.clear();
      reconciliationNeeded = false;
    },
    dispose: () => { disposed = true; requestId += 1; },
  };
}

/** Real is the production default; mock never receives auth events or silently replaces API errors. */
export function createSavedProvider(options: SavedProviderOptions = {}): SavedProvider {
  const source = options.source ?? 'real';
  const mock = source === 'mock' ? createMockSavedAdapter(options.mock) : undefined;
  const adapter = mock ?? createRealSavedAdapter(options.transport);
  const listeners = new Set<() => void>();
  let sessionRevision = 0;
  let disposed = false;
  let snapshot: SavedSnapshot;
  const emit = () => {
    if (disposed) return;
    const place = places.get();
    const course = courses.get();
    snapshot = {
      source, sessionRevision, places: place.list, courses: course.list,
      placeLikedById: place.liked, courseLikedById: course.liked,
      busyPlaceIds: place.busy, busyCourseIds: course.busy, updatedAt: Date.now(),
    };
    listeners.forEach(listener => listener());
  };
  const places = createListState<Place>(adapter.getPlaces, adapter.togglePlaceLike, () => sessionRevision, emit);
  const courses = createListState<Course>(adapter.getCourses, adapter.toggleCourseLike, () => sessionRevision, emit);
  emit();
  const resetForSession = () => {
    if (disposed) return;
    sessionRevision += 1;
    places.reset();
    courses.reset();
    emit();
  };
  const identity = (state: ReturnType<typeof useAuthStore.getState>) =>
    `${state.isLoggedIn}:${state.user?.provider ?? ''}:${state.user?.id ?? ''}`;
  const unsubscribe = source === 'real' ? useAuthStore.subscribe((next, previous) => {
    const unknownIdentityChanged = (!next.user || !previous.user) && next.accessToken !== previous.accessToken;
    if (identity(next) !== identity(previous) || unknownIdentityChanged) resetForSession();
  }) : undefined;
  return {
    source,
    getSnapshot: () => snapshot,
    subscribe: listener => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    refresh: async tab => {
      if (tab === 'places') await places.refresh();
      else if (tab === 'courses') await courses.refresh();
      else await Promise.all([places.refresh(), courses.refresh()]);
    },
    togglePlaceLike: places.toggle,
    toggleCourseLike: courses.toggle,
    resetForSession,
    resetFixture: mock ? scenario => { mock.reset(scenario); resetForSession(); } : undefined,
    dispose: () => {
      disposed = true;
      sessionRevision += 1;
      places.dispose();
      courses.dispose();
      unsubscribe?.();
      listeners.clear();
    },
  };
}

export const savedProvider = createSavedProvider();
