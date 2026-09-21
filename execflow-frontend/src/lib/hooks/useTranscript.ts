import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as transcriptsApi from "@/lib/api/transcripts";

const transcriptKey = (inputId: string) => ["transcript", inputId] as const;
const INPUTS_KEY = ["inputs"] as const;

export function useTranscript(inputId: string, enabled: boolean) {
  return useQuery({
    queryKey: transcriptKey(inputId),
    queryFn: () => transcriptsApi.getTranscript(inputId),
    enabled,
    retry: false, // a 404 here just means "not transcribed yet" - don't retry
  });
}

export function useTriggerTranscription(inputId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => transcriptsApi.triggerTranscription(inputId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transcriptKey(inputId) });
      queryClient.invalidateQueries({ queryKey: [...INPUTS_KEY, inputId] });
      queryClient.invalidateQueries({ queryKey: INPUTS_KEY });
    },
  });
}

export function useUpdateTranscript(inputId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => transcriptsApi.updateTranscript(inputId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transcriptKey(inputId) });
    },
  });
}
