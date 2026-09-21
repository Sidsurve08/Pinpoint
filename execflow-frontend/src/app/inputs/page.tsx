"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Mic, FileText, Trash2, Plus, PlayCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { InlineAudioPlayer } from "@/components/inputs/InlineAudioPlayer";
import { useInputs, useDeleteInput } from "@/lib/hooks/useInputs";
import { formatDateTime } from "@/lib/format";
import type { InputRecord, InputType } from "@/lib/types/input";

function TypeBadge({ type }: { type: InputType }) {
  const isVoice = type === "VOICE";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-2.5 py-0.5 text-xs font-medium text-ink">
      {isVoice ? <Mic size={12} /> : <FileText size={12} />}
      {isVoice ? "Audio" : "Text"}
    </span>
  );
}

export default function InputsPage() {
  const { data: inputs, isLoading, isError } = useInputs();
  const deleteInput = useDeleteInput();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | InputType>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!inputs) return [];
    return inputs.filter((input) => {
      const matchesSearch = input.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesType = typeFilter === "ALL" || input.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [inputs, search, typeFilter]);

  async function handleDelete(input: InputRecord) {
    if (!window.confirm(`Delete "${input.title}"? This can't be undone.`)) {
      return;
    }
    await deleteInput.mutateAsync(input.id);
  }

  return (
    <AppShell title="Inputs">
      <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
        Input History
      </h2>
      <p className="mt-1 text-sm text-muted">
        Review and manage your processed voice notes and text inputs.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inputs by title…"
            className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-accent"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "ALL" | InputType)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        >
          <option value="ALL">All types</option>
          <option value="TEXT">Text</option>
          <option value="VOICE">Voice</option>
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface">
        {isLoading && (
          <p className="p-8 text-center text-sm text-muted">Loading…</p>
        )}

        {isError && (
          <p className="p-8 text-center text-sm text-danger">
            Couldn&apos;t load inputs. Try refreshing the page.
          </p>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <p className="text-sm text-muted">
              {inputs && inputs.length > 0
                ? "No inputs match your search."
                : "No inputs yet. Create your first one to get started."}
            </p>
            {inputs && inputs.length === 0 && (
              <Link
                href="/inputs/new"
                className="flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                <Plus size={15} />
                New Input
              </Link>
            )}
          </div>
        )}

        {filtered.length > 0 && (
          <>
            {/* Table - desktop/tablet */}
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="border-b border-border bg-canvas">
                <tr>
                  <th className="label-caps px-5 py-3 font-medium">Title</th>
                  <th className="label-caps px-5 py-3 font-medium">Type</th>
                  <th className="label-caps px-5 py-3 font-medium">Created</th>
                  <th className="label-caps px-5 py-3 font-medium">Status</th>
                  <th className="label-caps px-5 py-3 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((input) => (
                  <React.Fragment key={input.id}>
                    <tr className="border-b border-border last:border-0 hover:bg-canvas/50">
                      <td className="px-5 py-4 font-medium text-ink">
                        <div className="flex items-center gap-2">
                          {input.type === "VOICE" && (
                            <button
                              onClick={() =>
                                setExpandedId(
                                  expandedId === input.id ? null : input.id
                                )
                              }
                              className="shrink-0 text-muted hover:text-ink"
                              aria-label="Play recording"
                            >
                              <PlayCircle size={17} />
                            </button>
                          )}
                          <Link
                            href={`/inputs/${input.id}`}
                            className="hover:underline"
                          >
                            {input.title}
                          </Link>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <TypeBadge type={input.type} />
                      </td>
                      <td className="px-5 py-4 text-muted">
                        {formatDateTime(input.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={input.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDelete(input)}
                          className="rounded-md p-1.5 text-muted hover:bg-status-overdue-bg hover:text-danger"
                          aria-label={`Delete ${input.title}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                    {expandedId === input.id && (
                      <tr className="border-b border-border bg-canvas/40 last:border-0">
                        <td colSpan={5} className="px-5 py-3">
                          <InlineAudioPlayer inputId={input.id} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {/* Cards - mobile */}
            <div className="divide-y divide-border md:hidden">
              {filtered.map((input) => (
                <div key={input.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      {input.type === "VOICE" && (
                        <button
                          onClick={() =>
                            setExpandedId(
                              expandedId === input.id ? null : input.id
                            )
                          }
                          className="shrink-0 text-muted hover:text-ink"
                          aria-label="Play recording"
                        >
                          <PlayCircle size={17} />
                        </button>
                      )}
                      <p className="truncate font-medium text-ink">
                        <Link href={`/inputs/${input.id}`} className="hover:underline">
                          {input.title}
                        </Link>
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(input)}
                      className="shrink-0 rounded-md p-1 text-muted hover:text-danger"
                      aria-label={`Delete ${input.title}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <TypeBadge type={input.type} />
                    <StatusBadge status={input.status} />
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {formatDateTime(input.createdAt)}
                  </p>
                  {expandedId === input.id && (
                    <div className="mt-3">
                      <InlineAudioPlayer inputId={input.id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
