import { create } from 'axios';

import { ApiError, toApiError } from '@/shared/api/error';
import { ENV } from '@/shared/config/env';

const serializeParams = (params: Record<string, unknown>): string => {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0 ? [[key, value.join(',')]] : [];
      }

      return [[key, String(value)]];
    })
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join('&');
};

export const apiClient = create({
  baseURL: ENV.apiUrl,
  paramsSerializer: {
    serialize: serializeParams,
  },
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(config => {
  if (!ENV.apiUrl && config.url?.startsWith('/')) {
    throw new ApiError('API 서버 주소가 설정되지 않았습니다.');
  }

  return config;
});

interface ApiEnvelope {
  code: string;
  data: unknown;
  message: string;
}

const isApiEnvelope = (value: unknown): value is ApiEnvelope => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'data' in value
  );
};

apiClient.interceptors.response.use(
  response => {
    // 백엔드는 모든 응답을 { code, message, data } 봉투로 감싸서 내려준다.
    // 호출부는 실제 payload(data)만 다루면 되도록 여기서 한 번에 벗겨낸다.
    if (isApiEnvelope(response.data)) {
      response.data = response.data.data;
    }

    return response;
  },
  error => Promise.reject(toApiError(error)),
);
