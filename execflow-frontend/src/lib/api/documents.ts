import { apiClient } from "./client";
import type { DocumentRecord, DocumentSummary } from "@/lib/types/document";

export async function generateBrief(inputId: string): Promise<DocumentRecord> {
  const { data } = await apiClient.post<DocumentRecord>(
    `/inputs/${inputId}/documents/brief`
  );
  return data;
}

export async function generateNotes(inputId: string): Promise<DocumentRecord> {
  const { data } = await apiClient.post<DocumentRecord>(
    `/inputs/${inputId}/documents/notes`
  );
  return data;
}

export async function listDocuments(): Promise<DocumentSummary[]> {
  const { data } = await apiClient.get<DocumentSummary[]>("/documents");
  return data;
}

export async function getDocument(id: string): Promise<DocumentRecord> {
  const { data } = await apiClient.get<DocumentRecord>(`/documents/${id}`);
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  await apiClient.delete(`/documents/${id}`);
}
