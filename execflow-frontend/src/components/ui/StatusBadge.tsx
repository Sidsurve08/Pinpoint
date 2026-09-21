import type { InputStatus } from "@/lib/types/input";

const STYLES: Record<InputStatus, { label: string; className: string }> = {
  CREATED: {
    label: "Created",
    className: "bg-status-pending-bg text-status-pending",
  },
  TRANSCRIBED: {
    label: "Transcribed",
    className: "bg-status-progress-bg text-status-progress",
  },
  ANALYZED: {
    label: "Analyzed",
    className: "bg-status-completed-bg text-status-completed",
  },
};

export function StatusBadge({ status }: { status: InputStatus }) {
  const { label, className } = STYLES[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
