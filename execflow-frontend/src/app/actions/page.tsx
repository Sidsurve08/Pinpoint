"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Trash2, Pencil, FileText } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { ActionStatusBadge } from "@/components/ui/ActionStatusBadge";
import { ActionFormModal } from "@/components/actions/ActionFormModal";
import {
  useActions,
  useCreateAction,
  useUpdateAction,
  useUpdateActionStatus,
  useDeleteAction,
} from "@/lib/hooks/useActions";
import { formatDate } from "@/lib/format";
import type { ActionItemRecord, ActionStatus } from "@/lib/types/analysis";
import type { ActionItemPayload } from "@/lib/api/actions";

type Tab = "ALL" | "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";

const TABS: { key: Tab; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED", label: "Completed" },
  { key: "OVERDUE", label: "Overdue" },
];

export default function ActionsPage() {
  const { data: actions, isLoading, isError } = useActions();
  const createAction = useCreateAction();
  const updateAction = useUpdateAction();
  const updateStatus = useUpdateActionStatus();
  const deleteAction = useDeleteAction();

  const [tab, setTab] = useState<Tab>("ALL");
  const [search, setSearch] = useState("");
  const [modalState, setModalState] = useState<
    { mode: "create" } | { mode: "edit"; item: ActionItemRecord } | null
  >(null);

  const filtered = useMemo(() => {
    if (!actions) return [];
    return actions.filter((a) => {
      const matchesTab =
        tab === "ALL" ||
        (tab === "OVERDUE" ? a.overdue && a.status !== "COMPLETED" : a.status === tab);
      const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [actions, tab, search]);

  async function handleSave(payload: ActionItemPayload) {
    if (modalState?.mode === "edit") {
      await updateAction.mutateAsync({ id: modalState.item.id, payload });
    } else {
      await createAction.mutateAsync(payload);
    }
  }

  async function handleDelete(item: ActionItemRecord) {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    await deleteAction.mutateAsync(item.id);
  }

  function handleStatusChange(item: ActionItemRecord, status: ActionStatus) {
    updateStatus.mutate({ id: item.id, status });
  }

  return (
    <AppShell title="Actions">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
            Action Tracker
          </h2>
          <p className="mt-1 text-sm text-muted">
            Manage and track executive deliverables and task assignments.
          </p>
        </div>
        <button
          onClick={() => setModalState({ mode: "create" })}
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          <Plus size={16} />
          Add Action
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "border-ink text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actions…"
            className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface">
        {isLoading && <p className="p-8 text-center text-sm text-muted">Loading…</p>}
        {isError && (
          <p className="p-8 text-center text-sm text-danger">
            Couldn&apos;t load actions. Try refreshing the page.
          </p>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <p className="p-10 text-center text-sm text-muted">
            {actions && actions.length > 0
              ? "No actions match this view."
              : "No action items yet. Add one, or generate some from an analysis."}
          </p>
        )}

        {filtered.length > 0 && (
          <>
            {/* Table - desktop/tablet */}
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="border-b border-border bg-canvas">
                <tr>
                  <th className="label-caps px-5 py-3 font-medium">Action</th>
                  <th className="label-caps px-5 py-3 font-medium">Owner</th>
                  <th className="label-caps px-5 py-3 font-medium">Deadline</th>
                  <th className="label-caps px-5 py-3 font-medium">Priority</th>
                  <th className="label-caps px-5 py-3 font-medium">Status</th>
                  <th className="label-caps px-5 py-3 font-medium">Source</th>
                  <th className="label-caps px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-canvas/50">
                    <td className="px-5 py-4 font-medium text-ink">
                      <span className={item.status === "COMPLETED" ? "line-through text-muted" : ""}>
                        {item.title}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted">{item.owner ?? "Unassigned"}</td>
                    <td
                      className={`px-5 py-4 ${item.overdue && item.status !== "COMPLETED" ? "font-medium text-danger" : "text-muted"}`}
                    >
                      {item.deadline ? formatDate(item.deadline) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleStatusChange(item, e.target.value as ActionStatus)
                        }
                        className="rounded-full border-0 bg-transparent text-xs font-medium outline-none"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                      {item.overdue && item.status !== "COMPLETED" && (
                        <div className="mt-1">
                          <ActionStatusBadge status={item.status} overdue />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {item.sourceTitle ? (
                        <span className="inline-flex items-center gap-1">
                          <FileText size={13} />
                          {item.sourceTitle}
                        </span>
                      ) : (
                        "Manual"
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setModalState({ mode: "edit", item })}
                          className="rounded-md p-1.5 text-muted hover:bg-canvas hover:text-ink"
                          aria-label={`Edit ${item.title}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="rounded-md p-1.5 text-muted hover:bg-status-overdue-bg hover:text-danger"
                          aria-label={`Delete ${item.title}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Cards - mobile */}
            <div className="divide-y divide-border md:hidden">
              {filtered.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className={`font-medium text-ink ${item.status === "COMPLETED" ? "line-through text-muted" : ""}`}
                    >
                      {item.title}
                    </p>
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => setModalState({ mode: "edit", item })}
                        className="rounded-md p-1 text-muted hover:text-ink"
                        aria-label={`Edit ${item.title}`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="rounded-md p-1 text-muted hover:text-danger"
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={item.priority} />
                    <ActionStatusBadge status={item.status} overdue={item.overdue} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                    <span>{item.owner ?? "Unassigned"}</span>
                    <span>{item.deadline ? formatDate(item.deadline) : "No deadline"}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {modalState && (
        <ActionFormModal
          initial={modalState.mode === "edit" ? modalState.item : undefined}
          onClose={() => setModalState(null)}
          onSubmit={handleSave}
        />
      )}
    </AppShell>
  );
}
