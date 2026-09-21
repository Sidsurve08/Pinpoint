"use client";

import { useState } from "react";
import {
  FileText,
  Mic,
  Wand2,
  Sparkles,
  Briefcase,
  ListChecks,
  MessageSquarePlus,
  Copy,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useRunAiTool } from "@/lib/hooks/useAiTools";
import { extractErrorMessage } from "@/lib/api/errors";
import type { AiToolType } from "@/lib/types/aiTools";

const TOOLS: { key: AiToolType; label: string; icon: React.ReactNode }[] = [
  { key: "SUMMARIZE", label: "Summarize", icon: <FileText size={15} /> },
  { key: "IMPROVE", label: "Improve", icon: <Wand2 size={15} /> },
  { key: "EXEC_READY", label: "Exec-Ready", icon: <Briefcase size={15} /> },
  { key: "EXTRACT_ACTIONS", label: "Extract Actions", icon: <ListChecks size={15} /> },
  { key: "ANALYZE", label: "Analyze", icon: <Sparkles size={15} /> },
  { key: "CUSTOM", label: "Custom Prompt", icon: <MessageSquarePlus size={15} /> },
];

export default function AiToolsPage() {
  const [text, setText] = useState("");
  const [tool, setTool] = useState<AiToolType>("SUMMARIZE");
  const [customPrompt, setCustomPrompt] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const runTool = useRunAiTool();

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  async function handleProcess() {
    setError(null);
    setCopied(false);
    if (!text.trim()) {
      setError("Paste some text first.");
      return;
    }
    if (tool === "CUSTOM" && !customPrompt.trim()) {
      setError("Enter a custom prompt.");
      return;
    }

    try {
      const result = await runTool.mutateAsync({
        text: text.trim(),
        tool,
        customPrompt: tool === "CUSTOM" ? customPrompt.trim() : undefined,
      });
      setOutput(result.output);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  function handleCopy() {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const selectedToolLabel = TOOLS.find((t) => t.key === tool)?.label ?? "";

  return (
    <AppShell title="AI Tools">
      <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
        AI Workbench
      </h2>
      <p className="mt-1 text-sm text-muted">
        Process raw inputs into executive-ready outputs.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Raw Input */}
        <div className="flex flex-col rounded-lg border border-border bg-surface p-5">
          <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
            <p className="label-caps">Raw Input</p>
            <div className="flex gap-2 text-muted">
              <FileText size={15} />
              <span title="Voice input coming soon">
                <Mic size={15} className="opacity-30" />
              </span>
            </div>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste transcript, notes, or raw data here…"
            rows={10}
            className="flex-1 resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
          <p className="mt-2 text-xs text-muted">{wordCount} words</p>

          <div className="mt-4">
            <p className="label-caps mb-2">Transformation</p>
            <div className="grid grid-cols-2 gap-2">
              {TOOLS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTool(t.key)}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    tool === t.key
                      ? "border-ink bg-ink text-white"
                      : "border-border text-ink hover:bg-canvas"
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {tool === "CUSTOM" && (
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Rewrite this as a LinkedIn post"
                className="mt-3 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              />
            )}
          </div>

          {error && (
            <p className="mt-3 rounded-md bg-status-overdue-bg px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <button
            onClick={handleProcess}
            disabled={runTool.isPending}
            className="mt-4 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {runTool.isPending ? "Processing…" : "Process Now"}
          </button>
        </div>

        {/* AI Output */}
        <div className="flex flex-col rounded-lg border border-border bg-surface p-5">
          <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <p className="label-caps">AI Output</p>
              {output && (
                <span className="rounded-full bg-canvas px-2 py-0.5 text-xs font-medium text-ink">
                  {selectedToolLabel}
                </span>
              )}
            </div>
            {output && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-muted hover:text-ink"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>

          {!output && !runTool.isPending && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-sm text-muted">
                Enter your raw data in the left panel, select a
                transformation tool, and click &quot;Process Now&quot; to
                generate an executive-ready output.
              </p>
            </div>
          )}

          {runTool.isPending && (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-muted">Processing…</p>
            </div>
          )}

          {output && !runTool.isPending && (
            <div className="flex-1">
              <p className="ai-output-scroll whitespace-pre-wrap text-sm leading-relaxed text-ink">
                {output}
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
