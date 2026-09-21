import { useMutation } from "@tanstack/react-query";
import { runAiTool } from "@/lib/api/aiTools";

export function useRunAiTool() {
  return useMutation({
    mutationFn: runAiTool,
  });
}
