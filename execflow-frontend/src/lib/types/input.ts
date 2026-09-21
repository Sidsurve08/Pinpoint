export type InputType = "VOICE" | "TEXT";
export type InputStatus = "CREATED" | "TRANSCRIBED" | "ANALYZED";

export interface InputRecord {
  id: string;
  type: InputType;
  title: string;
  rawText: string | null;
  status: InputStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInputPayload {
  type: InputType;
  title: string;
  rawText?: string;
}
