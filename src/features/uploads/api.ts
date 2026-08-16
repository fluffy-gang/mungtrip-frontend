import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

import type { PresignedUrlRequest, PresignedUrlResponse } from './types';

export const getPresignedUrl = async (
  body: PresignedUrlRequest,
): Promise<PresignedUrlResponse> => {
  const { data } = await apiClient.post<PresignedUrlResponse>(
    ENDPOINTS.uploads.presigned,
    body,
  );

  return data;
};

/**
 * presigned URL로 파일을 직접 S3에 업로드한다. URL 유효시간은 15분.
 * apiClient를 쓰지 않는다 — baseURL/Authorization 헤더가 S3 요청에 섞이면 안 된다.
 */
export const uploadFileToPresignedUrl = async (
  uploadUrl: string,
  fileUri: string,
  fileType: string,
): Promise<void> => {
  const fileResponse = await fetch(fileUri);
  const fileBlob = await fileResponse.blob();

  const uploadResponse = await fetch(uploadUrl, {
    body: fileBlob,
    headers: { 'Content-Type': fileType },
    method: 'PUT',
  });

  if (!uploadResponse.ok) {
    throw new Error('이미지 업로드에 실패했습니다.');
  }
};
