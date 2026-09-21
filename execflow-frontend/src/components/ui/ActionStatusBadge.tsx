import type { ActionStatus } from "@/lib/types/analysis";

const STYLES: Record<ActionStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-status-pending-bg text-status-pending" },
  IN_PROGRESS: { label: "In Progress", className: "bg-status-progress-bg text-status-progress" },
  COMPLETED: { label: "Completed", className: "bg-status-completed-bg text-status-completed" },
};

export function ActionStatusBadge({
  status,
  overdue,
}: {
  status: ActionStatus;
  overdue?: boolean;
}) {
  if (overdue && status !== "COMPLETED") {
    return (
      <span className="inline-flex items-center rounded-full bg-status-overdue-bg px-2.5 py-0.5 text-xs font-medium text-status-overdue">
        Overdue
      </span>
    );
  }

  const { label, className } = STYLES[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
