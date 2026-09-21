"use client";

import { useState, FormEvent } from "react";
import { X } from "lucide-react";
import type { ActionItemRecord, ActionStatus, Priority } from "@/lib/types/analysis";
import type { ActionItemPayload } from "@/lib/api/actions";

interface ActionFormModalProps {
  initial?: ActionItemRecord;
  onClose: () => void;
  onSubmit: (payload: ActionItemPayload) => Promise<void>;
}

export function ActionFormModal({ initial, onClose, onSubmit }: ActionFormModalProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [owner, setOwner] = useState(initial?.owner ?? "");
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "MEDIUM");
  const [status, setStatus] = useState<ActionStatus>(initial?.status ?? "PENDING");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        owner: owner.trim() || null,
        deadline: deadline || null,
        priority,
        status,
      });
      onClose();
    } catch {
      setError("Couldn't save this action. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">
            {initial ? "Edit Action" : "Add Action"}
          </h3>
          <button onClick={onClose} className="text-muted hover:text-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
            className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="Owner"
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            <input
              type="date"
              value={deadline ?? ""}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ActionStatus)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-canvas"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
