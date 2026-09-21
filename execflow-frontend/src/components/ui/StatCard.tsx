export function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "danger";
}) {
  return (
    <div
      className={`rounded-lg border p-4 sm:p-5 ${
        tone === "danger"
          ? "border-status-overdue/20 bg-status-overdue-bg"
          : "border-border bg-surface"
      }`}
    >
      <p
        className={`label-caps ${tone === "danger" ? "text-status-overdue" : ""}`}
      >
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-semibold sm:text-3xl ${
          tone === "danger" ? "text-status-overdue" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
