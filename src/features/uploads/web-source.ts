/** Browser picker URIs can be blob URLs or bundled asset URLs. */
export async function readWebBlob(uri: string, fetchSource: typeof fetch = fetch) {
  const response = await fetchSource(uri);
  if (!response.ok) throw new Error(`사진을 불러오지 못했어요. (${response.status})`);
  return response.blob();
}
