"use client";

import Link from "next/link";
import { Sparkles, FileText, Mic, ChevronRight, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useInputs } from "@/lib/hooks/useInputs";
import { formatDateTime } from "@/lib/format";

export default function AnalyzePage() {
  const { data: inputs, isLoading, isError } = useInputs();

  // TEXT inputs can always be analyzed; VOICE inputs need a transcript
  // first (status TRANSCRIBED or already ANALYZED).
  const analyzable =
    inputs?.filter(
      (input) => input.type === "TEXT" || input.status !== "CREATED"
    ) ?? [];

  return (
    <AppShell title="Analyze">
      <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
        Ready for Analysis
      </h2>
      <p className="mt-1 text-sm text-muted">
        Select an input to generate its executive summary, decisions, and
        action items.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface">
        {isLoading && <p className="p-8 text-center text-sm text-muted">Loading…</p>}

        {isError && (
          <p className="p-8 text-center text-sm text-danger">
            Couldn&apos;t load inputs. Try refreshing the page.
          </p>
        )}

        {!isLoading && !isError && analyzable.length === 0 && (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <p className="text-sm text-muted">
              Nothing ready to analyze yet. Voice notes need a transcript
              first.
            </p>
            <Link
              href="/inputs/new"
              className="flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
            >
              <Plus size={15} />
              New Input
            </Link>
          </div>
        )}

        <div className="divide-y divide-border">
          {analyzable.map((input) => (
            <Link
              key={input.id}
              href={`/inputs/${input.id}/analysis`}
              className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-canvas sm:p-5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas">
                  {input.type === "VOICE" ? <Mic size={16} /> : <FileText size={16} />}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{input.title}</p>
                  <p className="text-xs text-muted">
                    {formatDateTime(input.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <StatusBadge status={input.status} />
                {input.status === "ANALYZED" ? (
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <Sparkles size={13} />
                    View
                  </span>
                ) : null}
                <ChevronRight size={16} className="text-muted" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
