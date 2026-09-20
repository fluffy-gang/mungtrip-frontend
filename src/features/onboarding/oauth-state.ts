export function isOAuthStateValid(expected: string | null, returned: string) {
  return Boolean(expected && returned && expected === returned);
}

export function getOAuthCallbackAction(
  expectedState: string | null,
  returnedState: string,
  consumedState: string | null,
  consumedCode: string | null,
  code: string,
): 'consume' | 'duplicate' | 'invalid' {
  if (isOAuthStateValid(expectedState, returnedState)) return 'consume';
  if (consumedState === returnedState && consumedCode === code && code) return 'duplicate';
  return 'invalid';
}
