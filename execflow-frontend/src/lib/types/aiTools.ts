export type AiToolType =
  | "SUMMARIZE"
  | "IMPROVE"
  | "EXEC_READY"
  | "EXTRACT_ACTIONS"
  | "ANALYZE"
  | "CUSTOM";

export interface RunAiToolPayload {
  text: string;
  tool: AiToolType;
  customPrompt?: string | null;
}

export interface RunAiToolResult {
  output: string;
  wordCount: number;
}
