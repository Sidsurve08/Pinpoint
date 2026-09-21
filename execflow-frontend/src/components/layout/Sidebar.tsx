"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Mic,
  Sparkles,
  ListChecks,
  FileText,
  Wand2,
  Settings,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/Avatar";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inputs", label: "Inputs", icon: Inbox },
  { href: "/transcribe", label: "Transcribe", icon: Mic },
  { href: "/analyze", label: "Analyze", icon: Sparkles },
  { href: "/actions", label: "Actions", icon: ListChecks },
  { href: "/briefs", label: "Briefs & Notes", icon: FileText },
  { href: "/ai-tools", label: "AI Tools", icon: Wand2 },
] as const;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-border bg-surface transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
          <div>
            {/* No logo mark by design - text identity only. */}
            <p className="text-lg font-semibold leading-tight text-ink">
              ExecFlow AI
            </p>
            <p className="text-xs text-muted">Executive Suite</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted hover:bg-canvas lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-canvas font-medium text-ink"
                    : "text-ink/70 hover:bg-canvas hover:text-ink"
                }`}
              >
                <Icon size={17} strokeWidth={2} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            href="/settings"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              pathname.startsWith("/settings")
                ? "bg-canvas font-medium text-ink"
                : "text-ink/70 hover:bg-canvas hover:text-ink"
            }`}
          >
            <Settings size={17} strokeWidth={2} />
            Settings
          </Link>

          {user && (
            <div className="mt-2 flex items-center gap-3 px-3 py-2">
              <Avatar name={user.fullName} size={32} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {user.fullName}
                </p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
