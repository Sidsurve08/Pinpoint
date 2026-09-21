import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as inputsApi from "@/lib/api/inputs";
import type { CreateInputPayload } from "@/lib/types/input";

const INPUTS_KEY = ["inputs"] as const;

export function useInputs() {
  return useQuery({
    queryKey: INPUTS_KEY,
    queryFn: inputsApi.listInputs,
  });
}

export function useInput(id: string | undefined) {
  return useQuery({
    queryKey: [...INPUTS_KEY, id],
    queryFn: () => inputsApi.getInput(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateInput() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateInputPayload) => inputsApi.createInput(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INPUTS_KEY });
    },
  });
}

export function useDeleteInput() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inputsApi.deleteInput(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INPUTS_KEY });
    },
  });
}
