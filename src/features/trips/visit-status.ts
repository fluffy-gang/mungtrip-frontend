/** Swagger exposes an open string, so unknown server values must not imply unvisited. */
export const visitStatusLabel = (status?: string): string => {
  if (status === 'VISITED') return '방문 완료';
  if (status === 'REJECTED') return '방문 거절';
  if (status === 'NOT_VISITED') return '방문 전';
  return status ? '방문 상태 확인 필요' : '방문 기록 없음';
};

const REJECTION_LABELS: Readonly<Record<string, string>> = {
  NO_ENTRY_FOR_DOGS: '반려견 입장 불가',
  CROWDED: '만석/혼잡',
  CLOSED: '영업 종료',
  HARD_TO_ACCESS: '접근 어려움',
  OTHER: '기타',
};
/** Visit callbacks carry Swagger reason codes; presentation never exposes the raw enum. */
export const rejectReasonLabel = (reason?: string): string => REJECTION_LABELS[reason ?? ''] ?? '방문 거절';
