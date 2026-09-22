package com.execflow.dto.request;

import com.execflow.dto.ai.AiToolType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RunAiToolRequest(

        @NotBlank(message = "Text is required")
        String text,

        @NotNull(message = "A tool must be selected")
        AiToolType tool,

        /** Required only when tool=CUSTOM. */
        String customPrompt
) {
}
