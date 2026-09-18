import type { RejectReason, ReviewInput, VisitInput } from './types';

export const REJECTION_LABELS: Record<RejectReason, string> = {
  NO_ENTRY_FOR_DOGS: '반려견 입장 불가', CROWDED: '만석/혼잡', CLOSED: '영업 종료',
  HARD_TO_ACCESS: '접근 어려움', OTHER: '기타',
};
export function isRejectReason(value: unknown): value is RejectReason {
  return typeof value === 'string' && Object.hasOwn(REJECTION_LABELS, value);
}
export function validId(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}
export function requireId(value: unknown): asserts value is number {
  if (!validId(value)) throw new Error('장소 또는 기록 번호가 올바르지 않아요.');
}
export function parsePlaceId(value: string | string[] | undefined): number | undefined {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return undefined;
  const id = Number(value);
  return validId(id) ? id : undefined;
}
export function normalizeVisit(input: VisitInput): VisitInput {
  if (input.outcome === 'VISITED') {
    if (input.visitedAt && !/^\d{4}-\d{2}-\d{2}$/.test(input.visitedAt)) throw new Error('방문 날짜가 올바르지 않아요.');
    return { outcome: 'VISITED', ...(input.visitedAt ? { visitedAt: input.visitedAt } : {}) };
  }
  if (input.outcome !== 'REJECTED' || !isRejectReason(input.rejectReason)) throw new Error('거절 사유를 선택해 주세요.');
  if ((input.rejectDetail?.length ?? 0) > 500) throw new Error('거절 사유는 500자까지 입력할 수 있어요.');
  return { outcome: 'REJECTED', rejectReason: input.rejectReason, rejectDetail: input.rejectDetail?.trim() };
}
export function validateReview(input: ReviewInput) {
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) throw new Error('별점을 선택해 주세요.');
  if (input.content.length > 1000) throw new Error('후기는 1,000자까지 입력할 수 있어요.');
  if (input.dogId !== undefined) requireId(input.dogId);
  if (input.imageUrls.some(ref => !ref.trim() || /^(file:|content:|blob:|data:)/i.test(ref) || /[?&]x-amz-/i.test(ref))) {
    throw new Error('사진 업로드를 완료한 뒤 다시 시도해 주세요.');
  }
}
// TODO(#28): Resolve stored object keys after the backend supplies a display URL contract.
export function displayImageUri(reference: string): string | undefined {
  return /^https?:\/\//i.test(reference) && !/[?&]x-amz-/i.test(reference) ? reference : undefined;
}
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '요청을 처리하지 못했어요. 다시 시도해 주세요.';
}
