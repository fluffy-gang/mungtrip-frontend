import { isAxiosError } from 'axios';

type ApiErrorBody = {
  message?: string;
  error?: string | { message?: string };
};

export class ApiError extends Error {
  readonly status?: number;
  readonly data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const getMessageFromResponseData = (data: unknown): string | null => {
  if (typeof data === 'string') {
    return data;
  }

  if (!data || typeof data !== 'object') {
    return null;
  }

  const body = data as ApiErrorBody;

  if (body.message) {
    return body.message;
  }

  if (typeof body.error === 'string') {
    return body.error;
  }

  return body.error?.message ?? null;
};

export const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (isAxiosError(error)) {
    return (
      getMessageFromResponseData(error.response?.data) ??
      '요청 처리 중 문제가 발생했습니다.'
    );
  }

  return '알 수 없는 오류가 발생했습니다.';
};

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (isAxiosError(error)) {
    return new ApiError(
      getApiErrorMessage(error),
      error.response?.status,
      error.response?.data,
    );
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError(getApiErrorMessage(error));
};

export const isUnauthorizedApiError = (error: unknown): boolean => {
  if (error instanceof ApiError) {
    return error.status === 401;
  }

  return isAxiosError(error) && error.response?.status === 401;
};
