package com.execflow.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record DocumentContentPayload(
        String title,
        String executiveSummary,
        String background,             // BRIEF only
        String currentSituation,       // BRIEF only
        List<String> keyPoints,
        List<String> decisions,
        List<String> risks,            // BRIEF only
        List<String> opportunities,    // BRIEF only
        String recommendations,        // BRIEF only
        List<String> nextSteps,
        String context,                // NOTES only
        List<String> followUps,        // NOTES only
        List<ActionItemResponse> actionItems // NOTES only
) {
}
