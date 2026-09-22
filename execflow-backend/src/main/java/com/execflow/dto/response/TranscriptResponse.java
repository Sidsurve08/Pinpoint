package com.execflow.dto.response;

import com.execflow.entity.TranscriptSource;

import java.time.Instant;
import java.util.UUID;

public record TranscriptResponse(
        UUID id,
        UUID inputId,
        String content,
        TranscriptSource source,
        Instant createdAt,
        Instant updatedAt
) {
}
