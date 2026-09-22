package com.execflow.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiNotesNarrative(
        String title,
        String context,
        List<String> nextSteps
) {
}
