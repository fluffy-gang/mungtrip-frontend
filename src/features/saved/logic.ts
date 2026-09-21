import type { Place } from '@/features/places/types';

/** Category chips must follow the app-wide taxonomy order (see api.ts CATEGORY_LABELS), not item insertion order. */
export const orderCategories = (order: readonly string[], places: Place[]): string[] => {
  const present = new Set(places.map(place => place.category));
  return order.filter(code => present.has(code));
};

const verifiedDiffDays = (lastVerifiedAt?: string): number | null => {
  if (!lastVerifiedAt) return null;
  const verifiedAt = new Date(lastVerifiedAt);
  if (Number.isNaN(verifiedAt.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - verifiedAt.getTime()) / (1000 * 60 * 60 * 24)));
};

/** "유저인증 N"과 상대 시각을 나눠 돌려준다. Figma는 뒤쪽 "· N일전"을 다른 굵기/색으로 그린다.
 * null when the API omitted verification data (contract gap tracked in api.ts, issue #26). */
export const userVerifiedLabel = (place: Place): { count: string; relative: string | null } | null => {
  if (!place.verifiedCount) return null;
  const diffDays = verifiedDiffDays(place.lastVerifiedAt);
  const relative = diffDays === null ? null : diffDays === 0 ? '· 오늘' : `· ${diffDays}일전`;
  return { count: `유저인증 ${place.verifiedCount}`, relative };
};

export const toggleVisibleSelection = (selected: number[], visibleIds: number[]): number[] => {
  const visible = new Set(visibleIds);
  const allVisible = visibleIds.length > 0 && visibleIds.every(id => selected.includes(id));
  return allVisible ? selected.filter(id => !visible.has(id)) : [...new Set([...selected, ...visibleIds])];
};

export const pruneSelection = (selected: number[], places: Place[]): number[] => {
  const available = new Set(places.map(place => place.id));
  return selected.filter(id => available.has(id));
};

export const selectedPlaceModels = (selected: number[], places: Place[]): Place[] => {
  const ids = new Set(selected);
  return places.filter(place => ids.has(place.id));
};
