import { File } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch";
import { Platform } from "react-native";

import { apiClient } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { ApiError } from "@/shared/api/error";
import { readWebBlob } from "./web-source";

import type { PresignedUploadRequest, PresignedUploadResponse, UploadFileSource } from "./types";

export async function getPresignedUpload(body: PresignedUploadRequest) {
  const { data } = await apiClient.post<PresignedUploadResponse>(
    ENDPOINTS.uploads.presigned,
    body,
  );

  return data;
}

export async function uploadFile(
  source: UploadFileSource,
  fileType: string,
  uploadType: PresignedUploadRequest["uploadType"],
) {
  const presigned = await getPresignedUpload({ fileType, uploadType });
  const uploadResponse = Platform.OS === "web"
    // Storage CORS must allow https://mungtrip.site and https://staging.mungtrip.site, PUT, and Content-Type.
    ? await fetch(presigned.uploadUrl, {
      body: typeof source === "string" ? await readWebBlob(source) : source,
      headers: { "Content-Type": fileType },
      method: "PUT",
    })
    : await expoFetch(presigned.uploadUrl, {
      body: new File(requireNativeUri(source)),
      headers: { "Content-Type": fileType },
      method: "PUT",
    });

  if (!uploadResponse.ok) {
    throw new ApiError("사진을 업로드하지 못했어요.", uploadResponse.status);
  }

  return presigned.objectKey;
}

function requireNativeUri(source: UploadFileSource) {
  if (typeof source !== "string") throw new TypeError("Native uploads require a file URI.");
  return source;
}
