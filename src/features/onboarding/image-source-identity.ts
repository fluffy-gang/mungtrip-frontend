export function getImageSourceIdentity(source: unknown): string {
  if (source == null) return 'empty';
  if (typeof source === 'number' || typeof source === 'string') return String(source);
  if (Array.isArray(source)) return source.map(getImageSourceIdentity).join('|');
  return `uri:${typeof source === 'object' && source && 'uri' in source ? String(source.uri ?? '') : JSON.stringify(source)}`;
}
