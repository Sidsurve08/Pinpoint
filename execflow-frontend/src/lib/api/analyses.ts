import { apiClient } from "./client";
import type { AnalysisRecord } from "@/lib/types/analysis";

export async function triggerAnalysis(inputId: string): Promise<AnalysisRecord> {
  const { data } = await apiClient.post<AnalysisRecord>(`/inputs/${inputId}/analyze`);
  return data;
}

export async function getAnalysis(inputId: string): Promise<AnalysisRecord> {
  const { data } = await apiClient.get<AnalysisRecord>(`/inputs/${inputId}/analysis`);
  return data;
}
