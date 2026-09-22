package com.execflow.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Deadline is a plain String here (expected as "YYYY-MM-DD" or null) rather
 * than a LocalDate, because free LLMs don't always follow format
 * instructions perfectly - AnalysisService parses it defensively rather
 * than letting a malformed date blow up the whole analysis.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record AiActionItem(
        String title,
        String description,
        String owner,
        String deadline,
        String priority
) {
}
