"use client";

import Link from "next/link";
import { Mic, FileText, ClipboardCheck, Sparkles, Inbox, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { useDashboardSummary } from "@/lib/hooks/useDashboard";
import { formatDate, timeAgo } from "@/lib/format";
import type { ActivityItem } from "@/lib/types/dashboard";

function ActivityIcon({ type }: { type: string }) {
  const size = 14;
  switch (type) {
    case "INPUT_LOGGED":
      return <Inbox size={size} />;
    case "INPUT_ANALYZED":
      return <Sparkles size={size} />;
    case "BRIEF_GENERATED":
    case "NOTES_GENERATED":
      return <FileText size={size} />;
    default:
      return <ClipboardCheck size={size} />;
  }
}

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.fullName.split(" ")[0] ?? "there";
  const { data, isLoading, isError } = useDashboardSummary();

  return (
    <AppShell title="Dashboard">
      <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
        Good morning, {firstName}
      </h2>
      <p className="mt-1 text-sm text-muted">
        Here is your executive summary for today.
      </p>

      {isLoading && <p className="mt-8 text-center text-sm text-muted">Loading…</p>}
      {isError && (
        <p className="mt-8 text-center text-sm text-danger">
          Couldn&apos;t load your dashboard. Try refreshing the page.
        </p>
      )}

      {data && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            <StatCard label="Total Inputs" value={data.totalInputs} />
            <StatCard label="Pending Actions" value={data.pendingActions} />
            <StatCard label="In Progress" value={data.inProgressActions} />
            <StatCard label="Completed" value={data.completedActions} />
            <StatCard label="Overdue" value={data.overdueActions} tone="danger" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-surface lg:col-span-2">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h3 className="text-sm font-semibold text-ink">Priority Actions</h3>
                <Link href="/actions" className="text-xs text-muted hover:text-ink hover:underline">
                  View All
                </Link>
              </div>

              {data.priorityActions.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted">
                  No open action items right now.
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {data.priorityActions.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {item.owner ?? "Unassigned"}
                          {item.deadline ? ` · Due ${formatDate(item.deadline)}` : ""}
                        </p>
                      </div>
                      <PriorityBadge priority={item.priority} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border bg-surface">
              <div className="border-b border-border px-5 py-4">
                <h3 className="text-sm font-semibold text-ink">Recent Activity</h3>
              </div>
              {data.recentActivity.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted">Nothing yet.</p>
              ) : (
                <ul className="space-y-4 p-5">
                  {data.recentActivity.map((activity: ActivityItem, i: number) => (
                    <li key={i} className="flex gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-canvas text-muted">
                        <ActivityIcon type={activity.type} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink">{activity.title}</p>
                        <p className="truncate text-xs text-muted">{activity.description}</p>
                        <p className="mt-0.5 text-xs text-muted">{timeAgo(activity.timestamp)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="text-sm font-semibold text-ink">Recent Inputs</h3>
              <Link href="/inputs" className="text-xs text-muted hover:text-ink hover:underline">
                View All
              </Link>
            </div>

            {data.recentInputs.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted">
                No inputs yet. Create your first one to see it show up here.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {data.recentInputs.map((input) => (
                  <Link
                    key={input.id}
                    href={`/inputs/${input.id}`}
                    className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-canvas"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas">
                        {input.type === "VOICE" ? <Mic size={16} /> : <FileText size={16} />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{input.title}</p>
                        <p className="text-xs text-muted">
                          {input.type === "VOICE" ? "Voice Note" : "Text"} · {formatDate(input.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <StatusBadge status={input.status} />
                      <ChevronRight size={16} className="text-muted" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
