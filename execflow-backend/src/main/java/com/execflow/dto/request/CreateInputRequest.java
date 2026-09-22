package com.execflow.dto.request;

import com.execflow.entity.InputType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateInputRequest(

        @NotNull(message = "Type is required")
        InputType type,

        @NotBlank(message = "Title is required")
        String title,

        /**
         * Required when type=TEXT. Ignored for type=VOICE, where the
         * transcript is attached later via the Transcription module.
         */
        String rawText
) {
}
