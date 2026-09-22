package com.execflow.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiBriefNarrative(
        String title,
        String background,
        String currentSituation,
        String recommendations,
        List<String> nextSteps
) {
}
