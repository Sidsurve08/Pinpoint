import { AxiosError } from "axios";
import type { ApiFieldErrorResponse } from "@/lib/types/auth";

export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiFieldErrorResponse | undefined;
    if (data?.fieldErrors) {
      return Object.values(data.fieldErrors)[0] ?? data.message;
    }
    if (data?.message) {
      return data.message;
    }
  }
  return "Something went wrong. Please try again.";
}

export function extractFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiFieldErrorResponse | undefined;
    return data?.fieldErrors ?? {};
  }
  return {};
}
