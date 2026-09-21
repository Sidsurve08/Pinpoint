import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as documentsApi from "@/lib/api/documents";

const DOCUMENTS_KEY = ["documents"] as const;
const documentKey = (id: string) => ["documents", id] as const;

export function useDocuments() {
  return useQuery({
    queryKey: DOCUMENTS_KEY,
    queryFn: documentsApi.listDocuments,
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKey(id),
    queryFn: () => documentsApi.getDocument(id),
    enabled: Boolean(id),
  });
}

export function useGenerateBrief() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inputId: string) => documentsApi.generateBrief(inputId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY }),
  });
}

export function useGenerateNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inputId: string) => documentsApi.generateNotes(inputId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY }),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsApi.deleteDocument(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY }),
  });
}
