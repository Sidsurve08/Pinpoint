"use client";

import Link from "next/link";
import { FileText, NotebookPen, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { formatDate, timeAgo } from "@/lib/format";

export default function BriefsPage() {
  const { data: documents, isLoading, isError } = useDocuments();

  return (
    <AppShell title="Briefs & Notes">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
            Document Repository
          </h2>
          <p className="mt-1 text-sm text-muted">
            Manage your AI-generated briefs and meeting notes.
          </p>
        </div>
        <Link
          href="/analyze"
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          <Plus size={16} />
          Generate from an Input
        </Link>
      </div>

      {isLoading && <p className="mt-8 text-center text-sm text-muted">Loading…</p>}

      {isError && (
        <p className="mt-8 text-center text-sm text-danger">
          Couldn&apos;t load documents. Try refreshing the page.
        </p>
      )}

      {!isLoading && !isError && documents?.length === 0 && (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted">
            No briefs or notes yet. Analyze an input, then generate one from
            its Executive Intelligence page.
          </p>
          <Link
            href="/analyze"
            className="flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            <Plus size={15} />
            Go to Analyze
          </Link>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documents?.map((doc) => (
          <Link
            key={doc.id}
            href={`/briefs/${doc.id}`}
            className="flex flex-col rounded-lg border border-border bg-surface p-5 transition-shadow hover:shadow-sm"
          >
            <span
              className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                doc.type === "BRIEF" ? "bg-ink text-white" : "bg-canvas text-ink"
              }`}
            >
              {doc.type === "BRIEF" ? "Executive Brief" : "Meeting Note"}
            </span>

            <h3 className="mt-3 line-clamp-2 font-semibold text-ink">
              {doc.title}
            </h3>

            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted">
              {doc.type === "BRIEF" ? <FileText size={13} /> : <NotebookPen size={13} />}
              <span>{doc.type === "BRIEF" ? "Executive Brief" : "Meeting Notes"}</span>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
              <span>{formatDate(doc.createdAt)}</span>
              <span>Updated {timeAgo(doc.updatedAt)}</span>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
