import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as analysesApi from "@/lib/api/analyses";

const analysisKey = (inputId: string) => ["analysis", inputId] as const;
const INPUTS_KEY = ["inputs"] as const;

export function useAnalysis(inputId: string, enabled: boolean) {
  return useQuery({
    queryKey: analysisKey(inputId),
    queryFn: () => analysesApi.getAnalysis(inputId),
    enabled,
    retry: false, // a 404 just means "not analyzed yet"
  });
}

export function useTriggerAnalysis(inputId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => analysesApi.triggerAnalysis(inputId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analysisKey(inputId) });
      queryClient.invalidateQueries({ queryKey: [...INPUTS_KEY, inputId] });
      queryClient.invalidateQueries({ queryKey: INPUTS_KEY });
    },
  });
}
