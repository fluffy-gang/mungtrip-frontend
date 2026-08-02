import { AGREEMENT_URLS } from './constants';
import { clearSession, getStoredSession, saveSession } from './storage';
import { joinUrl } from '@/utils/url';

import type {
  AgreementDefinition,
  AgreementState,
  ApiResponse,
  AuthSession,
  Dog,
  DogSaveRequest,
  LoginProvider,
  LoginResponse,
  Personality,
} from './types';

const API_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL ?? 'https://dev.mungtrip.site';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
  }
}

let refreshRequest: Promise<AuthSession> | null = null;

async function parseResponse<T>(response: Response) {
  let body: ApiResponse<T> | undefined;

  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    // 빈 응답도 HTTP 상태를 기준으로 일관된 오류로 변환한다.
  }

  if (!response.ok) {
    throw new ApiError(body?.message ?? '요청을 처리하지 못했어요.', response.status, body?.code);
  }

  return body?.data as T;
}

async function reissueSession() {
  if (refreshRequest) return refreshRequest;

  refreshRequest = (async () => {
    const current = await getStoredSession();
    if (!current?.refreshToken) throw new ApiError('로그인이 필요해요.', 401);

    const response = await fetch(joinUrl(API_BASE_URL, '/api/v1/auth/reissue'), {
      body: JSON.stringify({ refreshToken: current.refreshToken }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    const data = await parseResponse<{
      accessToken: string;
      refreshToken: string;
      userId: number;
    }>(response);
    const next = { ...current, ...data };
    await saveSession(next);
    return next;
  })().finally(() => {
    refreshRequest = null;
  });

  try {
    return await refreshRequest;
  } catch (error) {
    if (error instanceof ApiError && [400, 401, 403].includes(error.status)) {
      await clearSession();
    }
    throw error;
  }
}

async function apiRequest<T>(path: string, init: RequestInit = {}, canRetry = true) {
  const session = await getStoredSession();
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  if (session?.accessToken) headers.set('Authorization', `Bearer ${session.accessToken}`);

  const response = await fetch(joinUrl(API_BASE_URL, path), { ...init, headers });
  if (response.status === 401 && canRetry && session?.refreshToken) {
    await reissueSession();
    return apiRequest<T>(path, init, false);
  }
  return parseResponse<T>(response);
}

export async function socialLogin(
  provider: LoginProvider,
  providerToken: string,
  deviceId: string,
) {
  const response = await fetch(joinUrl(API_BASE_URL, '/api/v1/auth/social-login'), {
    body: JSON.stringify({ deviceId, provider, providerToken }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
  return parseResponse<LoginResponse>(response);
}

export async function getAgreementDefinitions() {
  const data = await apiRequest<{ types: Omit<AgreementDefinition, 'url'>[] }>(
    '/api/v1/agreements',
  );
  return data.types.map((item) => ({ ...item, url: AGREEMENT_URLS[item.type] }));
}

export function getUserAgreements() {
  return apiRequest<{ agreements: AgreementState[]; allRequiredAgreed: boolean }>(
    '/api/v1/users/me/agreements',
  );
}

export function saveAgreements(agreements: AgreementState[]) {
  return apiRequest<void>('/api/v1/users/me/agreements', {
    body: JSON.stringify({ agreements }),
    method: 'POST',
  });
}

export async function getPersonalities() {
  const personalities = await apiRequest<Personality[]>('/api/v1/dog-personalities');
  return personalities.map((personality) => ({
    ...personality,
    name: personality.name.trim(),
  }));
}

export async function getDogs() {
  const data = await apiRequest<{ dogs: Dog[] }>('/api/v1/dogs');
  return data.dogs;
}

export async function createDog(payload: DogSaveRequest) {
  return apiRequest<{ dogId: number }>('/api/v1/dogs', {
    body: JSON.stringify(payload),
    method: 'POST',
  });
}

export async function updateDog(dogId: number, payload: DogSaveRequest) {
  return apiRequest<{ dogId: number }>(`/api/v1/dogs/${dogId}`, {
    body: JSON.stringify(payload),
    method: 'PUT',
  });
}

export async function uploadDogProfile(uri: string, fileType = 'image/jpeg') {
  const presigned = await apiRequest<{ objectKey: string; uploadUrl: string }>(
    '/api/v1/uploads/presigned',
    {
      body: JSON.stringify({ fileType, uploadType: 'DOG_PROFILE_IMAGE' }),
      method: 'POST',
    },
  );
  const localResponse = await fetch(uri);
  const blob = await localResponse.blob();
  const uploadResponse = await fetch(presigned.uploadUrl, {
    body: blob,
    headers: { 'Content-Type': fileType },
    method: 'PUT',
  });
  if (!uploadResponse.ok) throw new ApiError('사진을 업로드하지 못했어요.', uploadResponse.status);
  return presigned.objectKey;
}

export function toWireSize(size: import('./types').DogSize): import('./types').DogSizeWire {
  return { LARGE: 'L', MEDIUM: 'M', SMALL: 'S' }[size] as import('./types').DogSizeWire;
}

export function fromWireSize(size: import('./types').DogSizeWire): import('./types').DogSize {
  return { L: 'LARGE', M: 'MEDIUM', S: 'SMALL' }[size] as import('./types').DogSize;
}
