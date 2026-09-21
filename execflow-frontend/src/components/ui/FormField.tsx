import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
  icon?: ReactNode;
}

export function FormField({
  label,
  type = "text",
  value,
  onChange,
  error,
  autoComplete,
  placeholder,
  icon,
}: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`w-full rounded-md border bg-surface py-2 text-sm text-ink outline-none transition-colors focus:border-accent ${
            icon ? "pl-9 pr-3" : "px-3"
          } ${error ? "border-danger" : "border-border"}`}
        />
      </div>
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}
