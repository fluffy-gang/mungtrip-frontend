export interface PresignedUploadRequest {
  fileType: string;
  uploadType: 'DOG_PROFILE_IMAGE' | 'PLACE_IMAGE' | 'REVIEW_IMAGE';
}

export interface PresignedUploadResponse {
  objectKey: string;
  uploadUrl: string;
}
