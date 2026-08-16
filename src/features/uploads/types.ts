export type UploadType = 'DOG_PROFILE_IMAGE' | 'PLACE_IMAGE';

export interface PresignedUrlRequest {
  fileType: string;
  uploadType: UploadType;
}

export interface PresignedUrlResponse {
  objectKey: string;
  uploadUrl: string;
}
