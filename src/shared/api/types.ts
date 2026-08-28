export interface ApiEnvelope<T> {
  code: string;
  data: T;
  message: string;
}

export function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<ApiEnvelope<unknown>>;

  return (
    typeof candidate.code === 'string' &&
    typeof candidate.message === 'string' &&
    Object.prototype.hasOwnProperty.call(candidate, 'data')
  );
}
