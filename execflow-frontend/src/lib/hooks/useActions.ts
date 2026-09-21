import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as actionsApi from "@/lib/api/actions";
import type { ActionStatus } from "@/lib/types/analysis";
import type { ActionItemPayload } from "@/lib/api/actions";

const ACTIONS_KEY = ["actions"] as const;

export function useActions() {
  return useQuery({
    queryKey: ACTIONS_KEY,
    queryFn: actionsApi.listActions,
  });
}

export function useCreateAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ActionItemPayload) => actionsApi.createAction(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACTIONS_KEY }),
  });
}

export function useUpdateAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ActionItemPayload }) =>
      actionsApi.updateAction(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACTIONS_KEY }),
  });
}

export function useUpdateActionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ActionStatus }) =>
      actionsApi.updateActionStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACTIONS_KEY }),
  });
}

export function useDeleteAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actionsApi.deleteAction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACTIONS_KEY }),
  });
}
