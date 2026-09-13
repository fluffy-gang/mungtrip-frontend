import { create } from "axios";

import { ApiError, toApiError } from "@/shared/api/error";
import { isApiEnvelope } from "@/shared/api/types";
import { ENV } from "@/shared/config/env";

type ResponseErrorHandler = (error: unknown) => Promise<unknown>;

let responseErrorHandler: ResponseErrorHandler | null = null;

export const setResponseErrorHandler = (handler: ResponseErrorHandler) => {
  responseErrorHandler = handler;
};

const serializeParams = (params: Record<string, unknown>): string => {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0 ? [[key, value.join(",")]] : [];
      }

      return [[key, String(value)]];
    })
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");
};

export const apiClient = create({
  baseURL: ENV.apiUrl,
  paramsSerializer: {
    serialize: serializeParams,
  },
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (!ENV.apiUrl && config.url?.startsWith("/")) {
    throw new ApiError("API 서버 주소가 설정되지 않았습니다.");
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (isApiEnvelope(response.data)) {
      response.data = response.data.data;
    }

    return response;
  },
  async (error) => {
    if (!responseErrorHandler) throw toApiError(error);

    try {
      return await responseErrorHandler(error);
    } catch (handledError) {
      throw toApiError(handledError);
    }
  },
);
