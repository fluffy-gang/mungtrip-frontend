import { errorMessage, normalizeVisit, requireId, validateReview } from './validation';

import type { PlaceAdapter, PlaceData, PlaceProvider, PlaceSnapshot } from './types';

export const EMPTY_PLACE_DATA: PlaceData = {
  detail: { loading: false }, reviews: { loading: false, page: -1 }, nearby: { loading: false },
};
/** Stable snapshots, request deduplication and generation checks protect navigation/session changes. */
export function createProvider(adapter: PlaceAdapter): PlaceProvider {
  let snapshot: PlaceSnapshot = { sessionRevision: 0, places: {} };
  let sessionKey: string | undefined;
  let generation = 0;
  let unsubscribeSession: (() => void) | undefined;
  const listeners = new Set<() => void>();
  const pending = new Map<string, Promise<void>>();
  const mutations = new Set<string>();
  const publish = () => listeners.forEach(listener => listener());
  const current = (id: number) => snapshot.places[id] ?? EMPTY_PLACE_DATA;
  const update = (id: number, change: Partial<PlaceData>) => {
    snapshot = { ...snapshot, places: { ...snapshot.places, [id]: { ...current(id), ...change } } };
    publish();
  };
  async function guarded<T>(work: () => Promise<T>): Promise<T> {
    const started = generation;
    const result = await work();
    if (started !== generation) throw new Error('사용자 정보가 바뀌었어요. 다시 열어 주세요.');
    return result;
  }
  async function mutate<T>(key: string, work: () => Promise<T>): Promise<T> {
    if (mutations.has(key)) throw new Error('이미 처리 중이에요. 잠시 기다려 주세요.');
    const started = generation;
    mutations.add(key);
    try { return await guarded(work); }
    finally { if (started === generation) mutations.delete(key); }
  }
  function load(id: number, kind: keyof PlaceData, more = false, radius?: number): Promise<void> {
    requireId(id);
    const key = `${id}:${kind}`;
    const existing = pending.get(key);
    if (existing) return existing;
    const started = generation;
    const state = current(id);
    if (kind === 'reviews' && more && (!state.reviews.data?.hasNext || state.reviews.page < 0)) return Promise.resolve();
    const page = more ? state.reviews.page + 1 : 0;
    const operation = Promise.resolve().then(async () => {
      if (started !== generation) return;
      update(id, { [kind]: { ...current(id)[kind], loading: true, error: undefined } });
      try {
        if (kind === 'detail') {
          const data = await adapter.detail(id);
          if (started === generation) update(id, { detail: { loading: false, data } });
        } else if (kind === 'nearby') {
          const data = await adapter.nearby(id, radius);
          if (started === generation) update(id, { nearby: { loading: false, data } });
        } else {
          const feed = await adapter.reviews(id, page);
          if (started === generation) {
            const old = more ? current(id).reviews.data?.items ?? [] : [];
            update(id, { reviews: { loading: false, page, data: { ...feed, items: [...old, ...feed.items] } } });
          }
        }
      } catch (error) {
        if (started === generation) update(id, { [kind]: { ...current(id)[kind], loading: false, error: errorMessage(error) } });
      } finally {
        if (started === generation) pending.delete(key);
      }
    });
    pending.set(key, operation);
    return operation;
  }
  const refreshAfterWrite = async (id: number) => {
    const started = generation;
    // Let pre-mutation reads settle, then fetch authoritative post-mutation values.
    await Promise.all([pending.get(`${id}:detail`), pending.get(`${id}:reviews`)]);
    if (started !== generation) throw new Error('사용자 정보가 바뀌었어요. 다시 열어 주세요.');
    await Promise.all([load(id, 'detail'), load(id, 'reviews')]);
  };
  const provider: PlaceProvider = {
    source: adapter.source,
    getSnapshot: () => snapshot,
    subscribe: listener => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    loadDetail: id => load(id, 'detail'),
    loadReviews: (id, more) => load(id, 'reviews', more),
    loadNearby: (id, radius) => load(id, 'nearby', false, radius),
    visit: async (id, input) => {
      requireId(id);
      return mutate(`visit:${id}`, async () => {
        const visit = await guarded(() => adapter.visit(id, normalizeVisit(input)));
        await refreshAfterWrite(id);
        return visit;
      });
    },
    myReview: id => { requireId(id); return guarded(() => adapter.myReview(id)); },
    saveReview: async (id, input, existing) => {
      requireId(id); validateReview(input);
      if (existing && existing.placeId !== id) throw new Error('다른 장소의 후기예요. 다시 열어 주세요.');
      return mutate(`review:${id}`, async () => {
        const review = await guarded(() => existing
          ? adapter.updateReview(existing.reviewId, { rating: input.rating, content: input.content })
          : adapter.createReview(id, input));
        await refreshAfterWrite(id);
        return review;
      });
    },
    upload: photo => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(photo.mimeType)) return Promise.reject(new Error('JPG, PNG, WebP 사진을 선택해 주세요.'));
      return guarded(() => adapter.upload(photo));
    },
    dogs: () => guarded(() => adapter.dogs()),
    dispose: () => { unsubscribeSession?.(); unsubscribeSession = undefined; provider.resetForSession(); listeners.clear(); },
    resetForSession: key => {
      if (key !== undefined && key === sessionKey) return;
      sessionKey = key; generation += 1; pending.clear(); mutations.clear(); adapter.reset?.();
      snapshot = { sessionRevision: snapshot.sessionRevision + 1, places: {} }; publish();
    },
  };
  unsubscribeSession = adapter.subscribeSession?.(() => provider.resetForSession());
  return provider;
}
