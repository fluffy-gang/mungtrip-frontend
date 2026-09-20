import { pruneSelection, selectedPlaceModels, toggleVisibleSelection } from './logic';

import type { Course } from '@/features/courses/types';
import type { SavedCallbacks, SavedProvider, SavedTab } from './types';

interface ScreenState {
  tab: SavedTab;
  category: string;
  selectionMode: boolean;
  selectedIds: number[];
  busy: 'trip' | 'bulk' | 'course' | null;
  feedback: string | null;
}
const initial = (): ScreenState => ({ tab: 'places', category: 'all', selectionMode: false, selectedIds: [], busy: null, feedback: null });

/** Owns selection and async consumer actions, independently of route/sheet implementations. */
export function createSavedController(provider: SavedProvider) {
  let state = initial();
  let revision = provider.getSnapshot().sessionRevision;
  let operation = 0;
  const listeners = new Set<() => void>();
  let unsubscribe: (() => void) | undefined;
  const emit = () => listeners.forEach(listener => listener());
  const update = (patch: Partial<ScreenState>) => { state = { ...state, ...patch }; emit(); };
  const reconcile = () => {
    const snapshot = provider.getSnapshot();
    if (snapshot.sessionRevision !== revision) {
      revision = snapshot.sessionRevision;
      operation += 1;
      state = initial();
      emit();
      return;
    }
    const selectedIds = pruneSelection(state.selectedIds, snapshot.places.items);
    const category = state.category === 'all' || snapshot.places.items.some(item => item.category === state.category) ? state.category : 'all';
    if (category !== state.category || selectedIds.length !== state.selectedIds.length) update({ selectedIds, category });
  };
  const visiblePlaces = () => {
    const places = provider.getSnapshot().places.items;
    return state.category === 'all' ? places : places.filter(item => item.category === state.category);
  };
  const selectedPlaces = () => selectedPlaceModels(state.selectedIds, provider.getSnapshot().places.items);
  const begin = (kind: NonNullable<ScreenState['busy']>) => {
    reconcile();
    if (state.busy) return null;
    const token = { operation: ++operation, revision };
    update({ busy: kind, feedback: null });
    return token;
  };
  const current = (token: { operation: number; revision: number }) =>
    token.operation === operation && token.revision === provider.getSnapshot().sessionRevision;
  const finish = (token: { operation: number; revision: number }) => { if (current(token)) update({ busy: null }); };
  const feedback = (message: string) => update({ feedback: message });

  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      if (!unsubscribe) unsubscribe = provider.subscribe(reconcile);
      reconcile();
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          unsubscribe?.();
          unsubscribe = undefined;
          operation += 1;
          state = { ...state, busy: null };
        }
      };
    },
    visiblePlaces, selectedPlaces,
    setTab: (tab: SavedTab) => { if (!state.busy) update({ tab, selectionMode: false, selectedIds: [], feedback: null }); },
    setCategory: (category: string) => { if (!state.busy) update({ category }); },
    enterSelection: () => { if (!state.busy) update({ selectionMode: true, feedback: null }); },
    cancelSelection: () => { if (!state.busy) update({ selectionMode: false, selectedIds: [], feedback: null }); },
    toggleSelected: (id: number) => {
      reconcile();
      if (state.busy || !provider.getSnapshot().places.items.some(item => item.id === id)) return;
      update({ selectedIds: state.selectedIds.includes(id) ? state.selectedIds.filter(value => value !== id) : [...state.selectedIds, id] });
    },
    selectVisible: () => {
      reconcile();
      if (!state.busy) update({ selectedIds: toggleVisibleSelection(state.selectedIds, visiblePlaces().map(item => item.id)) });
    },
    clearFeedback: () => update({ feedback: null }),
    unavailable: () => feedback('이 기능은 연결 준비 중입니다.'),
    showMap: (callback: SavedCallbacks['onShowMap']) => {
      if (callback) callback({ places: visiblePlaces(), source: provider.source });
      else feedback('지도 연결이 아직 준비되지 않았습니다.');
    },
    async toggleLike(id: number, tab: SavedTab) {
      reconcile();
      if (state.busy) return;
      const started = provider.getSnapshot().sessionRevision;
      try {
        await (tab === 'places' ? provider.togglePlaceLike(id) : provider.toggleCourseLike(id));
      } catch (error) {
        if (started === provider.getSnapshot().sessionRevision) feedback(error instanceof Error ? error.message : '저장 상태를 변경하지 못했습니다.');
      }
    },
    async createTrip(callback: SavedCallbacks['onCreateOrAddTrip']) {
      reconcile();
      if (!selectedPlaces().length) return;
      if (!callback) { feedback('일정 연결이 아직 준비되지 않았습니다.'); return; }
      const token = begin('trip');
      if (!token) return;
      try {
        const result = await callback({ places: selectedPlaces(), source: provider.source });
        if (!current(token)) return;
        if (result === 'completed') update({ selectedIds: [], selectionMode: false });
      } catch {
        if (current(token)) feedback('일정에 추가하지 못했습니다. 선택한 장소는 유지됩니다.');
      } finally { finish(token); }
    },
    async addCourse(course: Course, callback: SavedCallbacks['onAddCourseToTrip']) {
      if (!callback) { feedback('일정 연결이 아직 준비되지 않았습니다.'); return; }
      const token = begin('course');
      if (!token) return;
      try { await callback({ course, source: provider.source }); }
      catch { if (current(token)) feedback('코스를 일정에 추가하지 못했습니다.'); }
      finally { finish(token); }
    },
    async unlikeSelected() {
      const token = begin('bulk');
      if (!token) return;
      const ids = [...state.selectedIds];
      let failures = 0;
      try {
        for (const id of ids) {
          if (!current(token)) return;
          const snapshot = provider.getSnapshot();
          // A prior uncertain failure may already have reconciled this ID to false.
          if (snapshot.placeLikedById[id] !== true || !snapshot.places.items.some(item => item.id === id)) continue;
          try {
            const result = await provider.togglePlaceLike(id);
            if (result.liked) failures += 1;
          } catch { failures += 1; }
        }
        if (current(token)) {
          reconcile();
          if (failures) feedback(`${failures}곳의 찜 해제를 확인하지 못했습니다. 목록을 확인한 뒤 다시 시도해 주세요.`);
        }
      } finally { finish(token); }
    },
  };
}
