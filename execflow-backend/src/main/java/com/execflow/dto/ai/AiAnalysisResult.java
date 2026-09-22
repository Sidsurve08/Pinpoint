package com.execflow.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiAnalysisResult(
        String executiveSummary,
        List<String> keyPoints,
        List<String> decisions,
        List<AiActionItem> actionItems,
        List<String> risks,
        List<String> opportunities,
        List<String> followUps,
        List<String> importantInformation
) {
}
