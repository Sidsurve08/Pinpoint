import { apiClient } from "./client";

export interface RecordingMetadata {
  id: string;
  inputId: string;
  fileName: string;
  format: string;
  durationSeconds: number | null;
  fileSizeBytes: number;
  createdAt: string;
}

export async function uploadRecording(
  inputId: string,
  file: File
): Promise<RecordingMetadata> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<RecordingMetadata>(
    `/inputs/${inputId}/recording`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

// Audio needs the JWT header to load, so a plain <audio src> tag won't
// work (the browser won't attach Authorization). We fetch the bytes
// through the authenticated client instead and hand the caller an
// object URL to play. Caller is responsible for revoking it.
export async function fetchRecordingObjectUrl(inputId: string): Promise<string> {
  const { data } = await apiClient.get(`/inputs/${inputId}/recording/download`, {
    responseType: "blob",
  });
  return URL.createObjectURL(data as Blob);
}
