import type { ReactNode } from "react";

export function SectionCard({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-border bg-surface p-5 ${className}`}>
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
        {icon}
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
      </div>
      {children}
    </div>
  );
}
