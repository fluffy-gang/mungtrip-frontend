/** Swagger exposes an open string, so unknown server values must not imply unvisited. */
export const visitStatusLabel = (status?: string): string => {
  if (status === 'VISITED') return '방문 완료';
  if (status === 'REJECTED') return '방문 거절';
  if (status === 'NOT_VISITED') return '방문 전';
  return status ? '방문 상태 확인 필요' : '방문 기록 없음';
};
