import { apiClient } from "./client";

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>("/health");
  return data;
}
