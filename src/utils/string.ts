function hasFinalConsonant(value: string) {
  const lastCharacter = value.trim().at(-1);
  if (!lastCharacter) return false;

  const hangulCode = lastCharacter.charCodeAt(0) - 0xac00;
  return hangulCode >= 0 && hangulCode <= 11171 && hangulCode % 28 !== 0;
}

export function appendObjectParticle(value: string, fallback = '우리 아이') {
  const subject = value.trim() || fallback;
  return `${subject}${hasFinalConsonant(subject) ? '을' : '를'}`;
}

export function appendSubjectParticle(value: string, fallback = '우리 아이') {
  const subject = value.trim() || fallback;
  return `${subject}${hasFinalConsonant(subject) ? '이' : '가'}`;
}
