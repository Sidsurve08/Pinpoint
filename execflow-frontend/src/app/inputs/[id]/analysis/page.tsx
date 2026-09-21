"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  FileText,
  Gavel,
  ListChecks,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  ClipboardList,
  RefreshCw,
  FileOutput,
  NotebookPen,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionCard } from "@/components/ui/SectionCard";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { useInput } from "@/lib/hooks/useInputs";
import { useAnalysis, useTriggerAnalysis } from "@/lib/hooks/useAnalysis";
import { useGenerateBrief, useGenerateNotes } from "@/lib/hooks/useDocuments";
import { formatDate } from "@/lib/format";
import { extractErrorMessage } from "@/lib/api/errors";

function BulletList({ items, emptyLabel }: { items: string[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">{emptyLabel}</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-ink">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { data: input, isLoading: inputLoading } = useInput(id);
  const {
    data: analysis,
    isLoading: analysisLoading,
    isError: analysisNotFound,
  } = useAnalysis(id, Boolean(input));
  const triggerAnalysis = useTriggerAnalysis(id);
  const generateBrief = useGenerateBrief();
  const generateNotes = useGenerateNotes();

  async function handleGenerate() {
    setError(null);
    try {
      await triggerAnalysis.mutateAsync();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function handleGenerateBrief() {
    setError(null);
    try {
      const doc = await generateBrief.mutateAsync(id);
      router.push(`/briefs/${doc.id}`);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function handleGenerateNotes() {
    setError(null);
    try {
      const doc = await generateNotes.mutateAsync(id);
      router.push(`/briefs/${doc.id}`);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  if (inputLoading || analysisLoading) {
    return (
      <AppShell title="Analysis">
        <p className="text-sm text-muted">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Executive Intelligence">
      <div className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-muted">
        <Link href="/inputs" className="hover:text-ink hover:underline">
          Inputs
        </Link>
        <ChevronRight size={14} />
        <Link href={`/inputs/${id}`} className="hover:text-ink hover:underline">
          {input?.title ?? "Input"}
        </Link>
        <ChevronRight size={14} />
        <span className="text-ink">Analysis</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
            Executive Intelligence
          </h2>
          {input && (
            <p className="mt-1 text-sm text-muted">Source: {input.title}</p>
          )}
        </div>

        {analysis && (
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              onClick={handleGenerate}
              disabled={triggerAnalysis.isPending}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-ink hover:bg-canvas disabled:opacity-50"
            >
              <RefreshCw size={14} />
              Regenerate
            </button>
            <button
              onClick={handleGenerateNotes}
              disabled={generateNotes.isPending}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-ink hover:bg-canvas disabled:opacity-50"
            >
              <NotebookPen size={14} />
              {generateNotes.isPending ? "Generating…" : "Generate Notes"}
            </button>
            <button
              onClick={handleGenerateBrief}
              disabled={generateBrief.isPending}
              className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
            >
              <FileOutput size={14} />
              {generateBrief.isPending ? "Generating…" : "Generate Brief"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-status-overdue-bg px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {!analysis && analysisNotFound && (
        <div className="mt-6 rounded-lg border border-dashed border-border p-10 text-center">
          <p className="mb-4 text-sm text-muted">
            This input hasn&apos;t been analyzed yet.
          </p>
          <button
            onClick={handleGenerate}
            disabled={triggerAnalysis.isPending}
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {triggerAnalysis.isPending ? "Analyzing…" : "Generate Analysis"}
          </button>
        </div>
      )}

      {analysis && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SectionCard
              title="Executive Summary"
              icon={<FileText size={16} />}
              className="lg:col-span-2"
            >
              <p className="ai-output-scroll whitespace-pre-wrap text-sm leading-relaxed text-ink">
                {analysis.executiveSummary || "No summary was generated."}
              </p>
            </SectionCard>

            <SectionCard title="Key Decisions" icon={<Gavel size={16} />}>
              <BulletList
                items={analysis.decisions}
                emptyLabel="No explicit decisions were identified."
              />
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SectionCard title="Key Points" icon={<ListChecks size={16} />}>
              <BulletList
                items={analysis.keyPoints}
                emptyLabel="No key points were identified."
              />
            </SectionCard>

            <SectionCard title="Risks & Opportunities" icon={<AlertTriangle size={16} />}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-danger">
                    <TrendingDown size={13} />
                    Risks
                  </p>
                  <BulletList items={analysis.risks} emptyLabel="None identified." />
                </div>
                <div>
                  <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-status-completed">
                    <TrendingUp size={13} />
                    Opportunities
                  </p>
                  <BulletList items={analysis.opportunities} emptyLabel="None identified." />
                </div>
              </div>
            </SectionCard>
          </div>

          {analysis.followUps.length > 0 && (
            <SectionCard title="Follow-ups" icon={<ClipboardList size={16} />}>
              <BulletList items={analysis.followUps} emptyLabel="None identified." />
            </SectionCard>
          )}

          <SectionCard title="Action Items" icon={<ClipboardList size={16} />}>
            {analysis.actionItems.length === 0 ? (
              <p className="text-sm text-muted">No action items were extracted.</p>
            ) : (
              <>
                {/* Table - desktop/tablet */}
                <table className="hidden w-full text-left text-sm md:table">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="label-caps py-2 pr-4 font-medium">Task</th>
                      <th className="label-caps py-2 pr-4 font-medium">Owner</th>
                      <th className="label-caps py-2 pr-4 font-medium">Deadline</th>
                      <th className="label-caps py-2 font-medium">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.actionItems.map((item) => (
                      <tr key={item.id} className="border-b border-border last:border-0">
                        <td className="py-3 pr-4 text-ink">{item.title}</td>
                        <td className="py-3 pr-4 text-muted">
                          {item.owner ?? "Unassigned"}
                        </td>
                        <td className="py-3 pr-4 text-muted">
                          {item.deadline ? formatDate(item.deadline) : "—"}
                        </td>
                        <td className="py-3">
                          <PriorityBadge priority={item.priority} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Cards - mobile */}
                <div className="space-y-3 md:hidden">
                  {analysis.actionItems.map((item) => (
                    <div key={item.id} className="rounded-md border border-border p-3">
                      <p className="font-medium text-ink">{item.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                        <span>{item.owner ?? "Unassigned"}</span>
                        <span>
                          {item.deadline ? formatDate(item.deadline) : "No deadline"}
                        </span>
                      </div>
                      <div className="mt-2">
                        <PriorityBadge priority={item.priority} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </SectionCard>
        </div>
      )}
    </AppShell>
  );
}
