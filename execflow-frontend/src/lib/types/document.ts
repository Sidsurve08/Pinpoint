import type { ActionItemRecord } from "./analysis";

export type DocumentType = "BRIEF" | "NOTES";

export interface DocumentSummary {
  id: string;
  inputId: string;
  type: DocumentType;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRecord {
  id: string;
  inputId: string;
  analysisId: string;
  type: DocumentType;
  title: string;
  executiveSummary: string;
  background: string | null;
  currentSituation: string | null;
  keyPoints: string[];
  decisions: string[];
  risks: string[];
  opportunities: string[];
  recommendations: string | null;
  nextSteps: string[];
  context: string | null;
  followUps: string[];
  actionItems: ActionItemRecord[];
  createdAt: string;
  updatedAt: string;
}
