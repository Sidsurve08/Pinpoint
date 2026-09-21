import { apiClient } from "./client";
import type { CreateInputPayload, InputRecord } from "@/lib/types/input";

export async function listInputs(): Promise<InputRecord[]> {
  const { data } = await apiClient.get<InputRecord[]>("/inputs");
  return data;
}

export async function getInput(id: string): Promise<InputRecord> {
  const { data } = await apiClient.get<InputRecord>(`/inputs/${id}`);
  return data;
}

export async function createInput(
  payload: CreateInputPayload
): Promise<InputRecord> {
  const { data } = await apiClient.post<InputRecord>("/inputs", payload);
  return data;
}

export async function deleteInput(id: string): Promise<void> {
  await apiClient.delete(`/inputs/${id}`);
}
