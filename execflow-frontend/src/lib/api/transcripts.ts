import { apiClient } from "./client";
import type { TranscriptRecord } from "@/lib/types/transcript";

export async function triggerTranscription(inputId: string): Promise<TranscriptRecord> {
  const { data } = await apiClient.post<TranscriptRecord>(
    `/inputs/${inputId}/transcribe`
  );
  return data;
}

export async function getTranscript(inputId: string): Promise<TranscriptRecord> {
  const { data } = await apiClient.get<TranscriptRecord>(
    `/inputs/${inputId}/transcript`
  );
  return data;
}

export async function updateTranscript(
  inputId: string,
  content: string
): Promise<TranscriptRecord> {
  const { data } = await apiClient.put<TranscriptRecord>(
    `/inputs/${inputId}/transcript`,
    { content }
  );
  return data;
}
