"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Pencil,
  RefreshCw,
  Sparkles,
  Save,
  X,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { InlineAudioPlayer } from "@/components/inputs/InlineAudioPlayer";
import { useInput } from "@/lib/hooks/useInputs";
import {
  useTranscript,
  useTriggerTranscription,
  useUpdateTranscript,
} from "@/lib/hooks/useTranscript";
import { formatDateTime } from "@/lib/format";
import { extractErrorMessage } from "@/lib/api/errors";

export default function InputDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: input, isLoading: inputLoading, isError: inputError } = useInput(id);

  const isVoice = input?.type === "VOICE";
  const {
    data: transcript,
    isLoading: transcriptLoading,
    isError: transcriptError,
  } = useTranscript(id, Boolean(isVoice));

  const triggerTranscription = useTriggerTranscription(id);
  const updateTranscript = useUpdateTranscript(id);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (transcript) setDraft(transcript.content);
  }, [transcript]);

  async function handleTranscribe() {
    setActionError(null);
    try {
      await triggerTranscription.mutateAsync();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  async function handleSave() {
    setActionError(null);
    try {
      await updateTranscript.mutateAsync(draft);
      setIsEditing(false);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  if (inputLoading) {
    return (
      <AppShell title="Input">
        <p className="text-sm text-muted">Loading…</p>
      </AppShell>
    );
  }

  if (inputError || !input) {
    return (
      <AppShell title="Input">
        <p className="text-sm text-danger">
          Couldn&apos;t load this input. It may have been deleted.
        </p>
        <button
          onClick={() => router.push("/inputs")}
          className="mt-4 text-sm text-ink hover:underline"
        >
          Back to Inputs
        </button>
      </AppShell>
    );
  }

  return (
    <AppShell title={input.title}>
      <div className="mb-4 flex items-center gap-1.5 text-sm text-muted">
        <Link href="/inputs" className="hover:text-ink hover:underline">
          Inputs
        </Link>
        <ChevronRight size={14} />
        <span className="text-ink">{input.title}</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="break-words text-2xl font-semibold text-ink sm:text-3xl">
            {input.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
            <span>{formatDateTime(input.createdAt)}</span>
            <StatusBadge status={input.status} />
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {isVoice && transcript && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-ink hover:bg-canvas"
            >
              <Pencil size={14} />
              Edit
            </button>
          )}
          {isVoice && transcript && (
            <button
              onClick={handleTranscribe}
              disabled={triggerTranscription.isPending}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-ink hover:bg-canvas disabled:opacity-50"
            >
              <RefreshCw size={14} />
              Re-transcribe
            </button>
          )}
          {(!isVoice || transcript) && (
            <Link
              href={`/inputs/${input.id}/analysis`}
              className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover"
            >
              <Sparkles size={14} />
              Analyze
            </Link>
          )}
        </div>
      </div>

      {actionError && (
        <p className="mt-4 rounded-md bg-status-overdue-bg px-3 py-2 text-sm text-danger">
          {actionError}
        </p>
      )}

      {isVoice ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="label-caps mb-3">Recording</p>
            <InlineAudioPlayer inputId={input.id} />
          </div>

          <div className="rounded-lg border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <p className="text-sm font-semibold text-ink">
                {transcript?.source === "MANUAL"
                  ? "Transcript (edited)"
                  : "AI Generated Transcript"}
              </p>
              {isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      if (transcript) setDraft(transcript.content);
                    }}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted hover:text-ink"
                  >
                    <X size={13} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updateTranscript.isPending}
                    className="flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-white hover:bg-accent-hover disabled:opacity-50"
                  >
                    <Save size={13} />
                    {updateTranscript.isPending ? "Saving…" : "Save"}
                  </button>
                </div>
              )}
            </div>

            <div className="p-5">
              {transcriptLoading && (
                <p className="text-sm text-muted">Loading transcript…</p>
              )}

              {!transcriptLoading && transcriptError && !transcript && (
                <div className="text-center">
                  <p className="mb-4 text-sm text-muted">
                    This recording hasn&apos;t been transcribed yet.
                  </p>
                  <button
                    onClick={handleTranscribe}
                    disabled={triggerTranscription.isPending}
                    className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
                  >
                    {triggerTranscription.isPending
                      ? "Transcribing… this can take a minute"
                      : "Transcribe Now"}
                  </button>
                </div>
              )}

              {transcript && isEditing && (
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={16}
                  className="w-full resize-y rounded-md border border-border bg-surface px-3 py-2 text-sm leading-relaxed text-ink outline-none focus:border-accent"
                />
              )}

              {transcript && !isEditing && (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                  {transcript.content}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-border bg-surface p-5">
          <p className="label-caps mb-3">Original Text</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
            {input.rawText}
          </p>
        </div>
      )}
    </AppShell>
  );
}
