"use client";

import { useRef, useState, DragEvent } from "react";
import { useRouter } from "next/navigation";
import { Mic, Upload, Circle, FileText, ArrowRight, X, FileAudio } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useCreateInput, useDeleteInput } from "@/lib/hooks/useInputs";
import { uploadRecording } from "@/lib/api/recordings";
import { extractErrorMessage } from "@/lib/api/errors";

const ALLOWED_EXTENSIONS = ["mp3", "wav", "m4a"];
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // matches backend multipart limit

function isAllowedAudioFile(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase();
  return Boolean(ext && ALLOWED_EXTENSIONS.includes(ext));
}

export default function NewInputPage() {
  const router = useRouter();
  const createInput = useCreateInput();
  const deleteInput = useDeleteInput();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Voice and text are mutually exclusive inputs, matching the two-card
  // design - picking one clears the other rather than silently ignoring it.
  function handleFileSelected(file: File) {
    setError(null);
    if (!isAllowedAudioFile(file)) {
      setError("Please upload an MP3, WAV, or M4A file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("File is too large. Maximum size is 50MB.");
      return;
    }
    setAudioFile(file);
    setText("");
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelected(file);
  }

  const canContinue =
    (text.trim().length > 0 || audioFile !== null) && !isProcessing;

  async function handleContinue() {
    setError(null);
    setIsProcessing(true);

    try {
      if (audioFile) {
        const created = await createInput.mutateAsync({
          type: "VOICE",
          title: title.trim() || audioFile.name,
        });

        try {
          await uploadRecording(created.id, audioFile);
        } catch (uploadErr) {
          // Don't leave an orphaned VOICE input with no recording behind -
          // there's no "attach recording later" UI yet, so roll it back.
          await deleteInput.mutateAsync(created.id).catch(() => {});
          throw uploadErr;
        }
      } else {
        await createInput.mutateAsync({
          type: "TEXT",
          title: title.trim() || text.trim().slice(0, 60),
          rawText: text.trim(),
        });
      }

      router.push("/inputs");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <AppShell title="New Input">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 text-center sm:mb-8">
          <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
            New Input
          </h2>
          <p className="mt-1 text-sm text-muted">
            Provide unstructured information via voice or text.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          {/* Voice Note */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`rounded-lg border p-6 transition-colors sm:p-8 ${
              isDragOver ? "border-accent bg-canvas" : "border-border bg-surface"
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-canvas">
                <Mic size={26} />
              </div>
              <h3 className="text-lg font-semibold text-ink">Voice Note</h3>
              <p className="mt-1 text-sm text-muted">
                Drag &amp; drop MP3, WAV, or M4A files here, or choose one
                below.
              </p>

              {audioFile ? (
                <div className="mt-5 flex w-full items-center justify-between gap-2 rounded-md border border-border bg-canvas px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileAudio size={16} className="shrink-0 text-muted" />
                    <span className="truncate text-sm text-ink">
                      {audioFile.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setAudioFile(null)}
                    className="shrink-0 rounded p-1 text-muted hover:text-ink"
                    aria-label="Remove file"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-md border border-border py-2.5 text-sm font-medium text-ink hover:bg-canvas"
                >
                  <Upload size={15} />
                  Upload Audio
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,.m4a,audio/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelected(file);
                  e.target.value = "";
                }}
              />

              <button
                disabled
                title="Live recording needs an in-browser encoder to produce MP3/WAV/M4A - coming in a later update. Upload a file for now."
                className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-md bg-danger py-2.5 text-sm font-medium text-white opacity-50"
              >
                <Circle size={12} fill="currentColor" />
                Record
              </button>
            </div>
          </div>

          {/* Text / Message */}
          <div className="rounded-lg border border-border bg-surface p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-2">
              <FileText size={18} />
              <h3 className="text-lg font-semibold text-ink">Text / Message</h3>
            </div>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="mb-3 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (e.target.value) setAudioFile(null);
              }}
              placeholder="Paste or type unstructured text here…"
              rows={8}
              className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-md bg-status-overdue-bg px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
          >
            {isProcessing ? "Saving…" : "Continue to Processing"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
