export function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return '잠시 후 다시 시도해주세요.';
  if (/failed to fetch|network request failed/i.test(error.message)) {
    return '서버에 연결하지 못했어요. 잠시 후 다시 시도해주세요.';
  }
  return error.message;
}
