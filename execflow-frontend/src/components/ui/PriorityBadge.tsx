import type { Priority } from "@/lib/types/analysis";

const STYLES: Record<Priority, string> = {
  LOW: "bg-canvas text-muted",
  MEDIUM: "bg-canvas text-ink",
  HIGH: "bg-status-overdue-bg text-danger",
  URGENT: "bg-danger text-white",
};

const LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[priority]}`}
    >
      {LABELS[priority]}
    </span>
  );
}
