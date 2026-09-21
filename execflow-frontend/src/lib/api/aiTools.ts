import { apiClient } from "./client";
import type { RunAiToolPayload, RunAiToolResult } from "@/lib/types/aiTools";

export async function runAiTool(payload: RunAiToolPayload): Promise<RunAiToolResult> {
  const { data } = await apiClient.post<RunAiToolResult>("/ai-tools/process", payload);
  return data;
}
