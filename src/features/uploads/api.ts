import { apiClient } from '@/shared/api/client';
import { ApiError } from '@/shared/api/error';
import { ENDPOINTS } from '@/shared/api/endpoints';

import type {
  PresignedUploadRequest,
  PresignedUploadResponse,
} from './types';

export async function getPresignedUpload(body: PresignedUploadRequest) {
  const { data } = await apiClient.post<PresignedUploadResponse>(
    ENDPOINTS.uploads.presigned,
    body,
  );

  return data;
}

export async function uploadFile(
  uri: string,
  fileType: string,
  uploadType: PresignedUploadRequest['uploadType'],
) {
  const presigned = await getPresignedUpload({ fileType, uploadType });
  const localResponse = await fetch(uri);
  const blob = await localResponse.blob();
  const uploadResponse = await fetch(presigned.uploadUrl, {
    body: blob,
    headers: { 'Content-Type': fileType },
    method: 'PUT',
  });

  if (!uploadResponse.ok) {
    throw new ApiError('사진을 업로드하지 못했어요.', uploadResponse.status);
  }

  return presigned.objectKey;
}
