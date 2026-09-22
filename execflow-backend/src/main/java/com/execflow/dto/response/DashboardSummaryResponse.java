package com.execflow.dto.response;

import java.util.List;

public record DashboardSummaryResponse(
        long totalInputs,
        long pendingActions,
        long inProgressActions,
        long completedActions,
        long overdueActions,
        List<InputResponse> recentInputs,
        List<ActionItemResponse> priorityActions,
        List<ActivityItemResponse> recentActivity
) {
}
