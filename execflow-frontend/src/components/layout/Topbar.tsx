"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, Bell, Settings, LogOut, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/Avatar";

export function Topbar({
  title,
  onMenuClick,
}: {
  title: string;
  onMenuClick: () => void;
}) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-8">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-muted hover:bg-canvas lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="truncate text-lg font-semibold text-ink sm:text-xl">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/inputs/new"
          className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Input</span>
        </Link>

        <button
          className="hidden rounded-md p-2 text-muted hover:bg-canvas sm:block"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <Link
          href="/settings"
          className="hidden rounded-md p-2 text-muted hover:bg-canvas sm:block"
          aria-label="Settings"
        >
          <Settings size={18} />
        </Link>

        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Account menu"
            >
              <Avatar name={user.fullName} size={32} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-border bg-surface py-1 shadow-lg">
                <div className="border-b border-border px-3 py-2">
                  <p className="truncate text-sm font-medium text-ink">
                    {user.fullName}
                  </p>
                  <p className="truncate text-xs text-muted">{user.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-canvas"
                >
                  <LogOut size={15} />
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
