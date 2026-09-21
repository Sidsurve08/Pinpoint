import type { ActionItemRecord } from "./analysis";
import type { InputRecord } from "./input";

export interface ActivityItem {
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface DashboardSummary {
  totalInputs: number;
  pendingActions: number;
  inProgressActions: number;
  completedActions: number;
  overdueActions: number;
  recentInputs: InputRecord[];
  priorityActions: ActionItemRecord[];
  recentActivity: ActivityItem[];
}
