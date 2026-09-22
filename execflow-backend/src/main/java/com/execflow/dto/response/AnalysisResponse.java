package com.execflow.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AnalysisResponse(
        UUID id,
        UUID inputId,
        String executiveSummary,
        List<String> keyPoints,
        List<String> decisions,
        List<String> risks,
        List<String> opportunities,
        List<String> followUps,
        List<String> importantInformation,
        List<ActionItemResponse> actionItems,
        Instant createdAt,
        Instant updatedAt
) {
}
