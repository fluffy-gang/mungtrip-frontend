import { validateReview } from '../detail/validation';

import type { PlaceProvider, PlaceReview, ReviewInput, SelectedPhoto } from '../detail/types';

/** Local preview URIs never enter review payloads, and failed uploads prevent review creation. */
export async function saveReviewWithPhotos(provider: PlaceProvider, placeId: number,
  input: Omit<ReviewInput, 'imageUrls'>, photos: SelectedPhoto[], existing?: PlaceReview) {
  validateReview({ ...input, imageUrls: [] });
  if (existing) return provider.saveReview(placeId, { ...input, imageUrls: existing.imageUrls }, existing);
  const revision = provider.getSnapshot().sessionRevision;
  const imageUrls: string[] = [];
  for (const photo of photos) imageUrls.push(await provider.upload(photo));
  if (revision !== provider.getSnapshot().sessionRevision) throw new Error('사용자 정보가 바뀌었어요. 다시 열어 주세요.');
  return provider.saveReview(placeId, { ...input, imageUrls });
}
