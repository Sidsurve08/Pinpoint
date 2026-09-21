"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Trash2, AlertTriangle, TrendingUp, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useDocument, useDeleteDocument } from "@/lib/hooks/useDocuments";
import { formatDate } from "@/lib/format";

export default function DocumentViewerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: doc, isLoading, isError } = useDocument(id);
  const deleteDocument = useDeleteDocument();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!doc || !window.confirm(`Delete "${doc.title}"?`)) return;
    setIsDeleting(true);
    try {
      await deleteDocument.mutateAsync(doc.id);
      router.push("/briefs");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <AppShell title="Document">
        <p className="text-sm text-muted">Loading…</p>
      </AppShell>
    );
  }

  if (isError || !doc) {
    return (
      <AppShell title="Document">
        <p className="text-sm text-danger">
          Couldn&apos;t load this document. It may have been deleted.
        </p>
        <Link href="/briefs" className="mt-4 inline-block text-sm text-ink hover:underline">
          Back to Briefs & Notes
        </Link>
      </AppShell>
    );
  }

  const isBrief = doc.type === "BRIEF";

  return (
    <AppShell title={doc.title}>
      <div className="mb-4 flex items-center gap-1.5 text-sm text-muted">
        <Link href="/briefs" className="hover:text-ink hover:underline">
          Briefs & Notes
        </Link>
        <ChevronRight size={14} />
        <span className="text-ink">{doc.title}</span>
      </div>

      <div className="mx-auto max-w-3xl rounded-lg border border-border bg-surface p-6 sm:p-10">
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="label-caps mb-1">
              {isBrief ? "Executive Brief" : "Meeting Notes"}
            </p>
            <h1 className="text-2xl font-semibold text-ink sm:text-3xl">
              {doc.title}
            </h1>
            <p className="mt-2 text-sm text-muted">
              Generated: {formatDate(doc.createdAt)}
            </p>
          </div>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="shrink-0 rounded-md p-2 text-muted hover:bg-status-overdue-bg hover:text-danger"
            aria-label="Delete document"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="space-y-8">
          <Section title="Executive Summary">
            <Prose text={doc.executiveSummary} />
          </Section>

          {isBrief && doc.background && (
            <Section title="Background">
              <Prose text={doc.background} />
            </Section>
          )}

          {isBrief && doc.currentSituation && (
            <Section title="Current Situation">
              <Prose text={doc.currentSituation} />
            </Section>
          )}

          {!isBrief && doc.context && (
            <Section title="Context">
              <Prose text={doc.context} />
            </Section>
          )}

          {doc.keyPoints.length > 0 && (
            <Section title={isBrief ? "Key Points" : "Key Discussion Points"}>
              <div className="rounded-md bg-canvas p-4">
                <BulletList items={doc.keyPoints} />
              </div>
            </Section>
          )}

          {doc.decisions.length > 0 && (
            <Section title={isBrief ? "Decisions Required" : "Decisions"}>
              <ol className="list-decimal space-y-1.5 pl-5 text-sm text-ink">
                {doc.decisions.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ol>
            </Section>
          )}

          {!isBrief && doc.actionItems.length > 0 && (
            <Section title="Action Items">
              <ul className="space-y-2">
                {doc.actionItems.map((item) => (
                  <li key={item.id} className="flex items-start gap-2 text-sm text-ink">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-muted" />
                    <span>
                      <span className="font-medium">{item.title}</span>
                      {item.owner && <span className="text-muted"> — {item.owner}</span>}
                      {item.deadline && (
                        <span className="text-muted"> · Due {formatDate(item.deadline)}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {isBrief && (doc.risks.length > 0 || doc.opportunities.length > 0) && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {doc.risks.length > 0 && (
                <Section title="Risks" icon={<AlertTriangle size={14} className="text-danger" />}>
                  <BulletList items={doc.risks} />
                </Section>
              )}
              {doc.opportunities.length > 0 && (
                <Section
                  title="Opportunities"
                  icon={<TrendingUp size={14} className="text-status-completed" />}
                >
                  <BulletList items={doc.opportunities} />
                </Section>
              )}
            </div>
          )}

          {isBrief && doc.recommendations && (
            <Section title="Recommendations">
              <Prose text={doc.recommendations} />
            </Section>
          )}

          {!isBrief && doc.followUps.length > 0 && (
            <Section title="Follow-ups">
              <BulletList items={doc.followUps} />
            </Section>
          )}

          {doc.nextSteps.length > 0 && (
            <Section title="Next Steps">
              <ul className="space-y-2">
                {doc.nextSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-muted" />
                    {step}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-2 flex items-center gap-1.5 border-l-2 border-ink pl-3 text-base font-semibold text-ink">
        {icon}
        {title}
      </h2>
      <div className="pl-3">{children}</div>
    </div>
  );
}

function Prose({ text }: { text: string }) {
  return (
    <p className="ai-output-scroll whitespace-pre-wrap text-sm leading-relaxed text-ink">
      {text}
    </p>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 text-sm text-ink">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink" />
          {item}
        </li>
      ))}
    </ul>
  );
}
