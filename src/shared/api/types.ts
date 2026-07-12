export type ApiEnvelope<T> = {
  success?: boolean;
  data: T;
  message?: string;
};

export type ApiPayload<T> = T | ApiEnvelope<T>;

const isApiEnvelope = <T>(payload: ApiPayload<T>): payload is ApiEnvelope<T> => {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    !Array.isArray(payload) &&
    'data' in payload
  );
};

export const unwrapApiData = <T>(payload: ApiPayload<T>): T => {
  return isApiEnvelope(payload) ? payload.data : payload;
};
