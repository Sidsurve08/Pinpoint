export type TranscriptSource = "AI_GENERATED" | "MANUAL";

export interface TranscriptRecord {
  id: string;
  inputId: string;
  content: string;
  source: TranscriptSource;
  createdAt: string;
  updatedAt: string;
}
