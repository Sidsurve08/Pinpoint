import { apiClient } from "./client";
import type { ActionItemRecord, ActionStatus, Priority } from "@/lib/types/analysis";

export interface ActionItemPayload {
  title: string;
  description?: string | null;
  owner?: string | null;
  deadline?: string | null;
  priority: Priority;
  status: ActionStatus;
}

export async function listActions(): Promise<ActionItemRecord[]> {
  const { data } = await apiClient.get<ActionItemRecord[]>("/actions");
  return data;
}

export async function createAction(
  payload: ActionItemPayload
): Promise<ActionItemRecord> {
  const { data } = await apiClient.post<ActionItemRecord>("/actions", payload);
  return data;
}

export async function updateAction(
  id: string,
  payload: ActionItemPayload
): Promise<ActionItemRecord> {
  const { data } = await apiClient.put<ActionItemRecord>(`/actions/${id}`, payload);
  return data;
}

export async function updateActionStatus(
  id: string,
  status: ActionStatus
): Promise<ActionItemRecord> {
  const { data } = await apiClient.patch<ActionItemRecord>(`/actions/${id}/status`, {
    status,
  });
  return data;
}

export async function deleteAction(id: string): Promise<void> {
  await apiClient.delete(`/actions/${id}`);
}
