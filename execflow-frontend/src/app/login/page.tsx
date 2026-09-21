"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { FormField } from "@/components/ui/FormField";
import { extractErrorMessage, extractFieldErrors } from "@/lib/api/errors";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (error) {
      setFieldErrors(extractFieldErrors(error));
      setFormError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-ink">ExecFlow AI</h1>
          <p className="mt-1 text-sm text-muted">Executive Suite Access</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              error={fieldErrors.email}
              autoComplete="email"
              placeholder="executive@company.com"
              icon={<Mail size={16} />}
            />
            <FormField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              error={fieldErrors.password}
              autoComplete="current-password"
              icon={<Lock size={16} />}
            />

            {formError && (
              <p className="rounded-md bg-status-overdue-bg px-3 py-2 text-sm text-danger">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Access is by invitation only.{" "}
          <Link href="/register" className="text-ink hover:underline">
            Have an invite code?
          </Link>
        </p>
      </div>
    </div>
  );
}
