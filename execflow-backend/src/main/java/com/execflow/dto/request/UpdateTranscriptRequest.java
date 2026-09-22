package com.execflow.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateTranscriptRequest(

        @NotBlank(message = "Transcript content cannot be empty")
        String content
) {
}
