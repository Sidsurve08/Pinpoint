export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type ActionStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface ActionItemRecord {
  id: string;
  title: string;
  description: string | null;
  owner: string | null;
  deadline: string | null; // ISO date, e.g. "2023-10-15"
  priority: Priority;
  status: ActionStatus;
  overdue: boolean;
  sourceTitle: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisRecord {
  id: string;
  inputId: string;
  executiveSummary: string;
  keyPoints: string[];
  decisions: string[];
  risks: string[];
  opportunities: string[];
  followUps: string[];
  importantInformation: string[];
  actionItems: ActionItemRecord[];
  createdAt: string;
  updatedAt: string;
}
