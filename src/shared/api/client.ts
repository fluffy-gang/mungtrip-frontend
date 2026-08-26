import { create, isAxiosError, type InternalAxiosRequestConfig } from 'axios';

import { ApiError, toApiError } from '@/shared/api/error';
import { ENV } from '@/shared/config/env';

const requestStartedAt = new WeakMap<InternalAxiosRequestConfig, number>();
const sensitiveKeyPattern = /authorization|cookie|password|secret|token/i;

const redactSensitiveValues = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(redactSensitiveValues);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [
      key,
      sensitiveKeyPattern.test(key)
        ? '[REDACTED]'
        : redactSensitiveValues(nestedValue),
    ]),
  );
};

const getRequestLabel = (config: InternalAxiosRequestConfig): string => {
  const method = config.method?.toUpperCase() ?? 'GET';
  const baseURL = config.baseURL ?? '';
  const url = config.url ?? '';

  return `${method} ${baseURL}${url}`;
};

const getRequestDuration = (config: InternalAxiosRequestConfig): number | null => {
  const startedAt = requestStartedAt.get(config);

  return startedAt === undefined ? null : Math.round(performance.now() - startedAt);
};

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

if (__DEV__) {
  apiClient.interceptors.request.use(config => {
    requestStartedAt.set(config, performance.now());
    console.log(`[API →] ${getRequestLabel(config)}`, {
      params: redactSensitiveValues(config.params),
      data: redactSensitiveValues(config.data),
    });

    return config;
  });

  apiClient.interceptors.response.use(
    response => {
      const duration = getRequestDuration(response.config);
      console.log(
        `[API ←] ${response.status} ${getRequestLabel(response.config)}` +
          (duration === null ? '' : ` (${duration}ms)`),
        { data: redactSensitiveValues(response.data) },
      );

      return response;
    },
    error => {
      if (isAxiosError(error) && error.config) {
        const duration = getRequestDuration(error.config);
        console.error(
          `[API ✕] ${error.response?.status ?? error.code ?? 'NETWORK'} ${getRequestLabel(error.config)}` +
            (duration === null ? '' : ` (${duration}ms)`),
          {
            message: error.message,
            data: redactSensitiveValues(error.response?.data),
          },
        );
      } else {
        console.error('[API ✕] Unknown request error', error);
      }

      return Promise.reject(error);
    },
  );
}

apiClient.interceptors.request.use(config => {
  if (!ENV.apiUrl && config.url?.startsWith('/')) {
    throw new ApiError('API 서버 주소가 설정되지 않았습니다.');
  }

  return config;
});

apiClient.interceptors.response.use(
  response => response,
  error => Promise.reject(toApiError(error)),
);
