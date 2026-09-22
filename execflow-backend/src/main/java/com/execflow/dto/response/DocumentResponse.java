package com.execflow.dto.response;

import com.execflow.entity.DocumentType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record DocumentResponse(
        UUID id,
        UUID inputId,
        UUID analysisId,
        DocumentType type,
        String title,
        String executiveSummary,
        String background,
        String currentSituation,
        List<String> keyPoints,
        List<String> decisions,
        List<String> risks,
        List<String> opportunities,
        String recommendations,
        List<String> nextSteps,
        String context,
        List<String> followUps,
        List<ActionItemResponse> actionItems,
        Instant createdAt,
        Instant updatedAt
) {
}
