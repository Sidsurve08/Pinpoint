package com.execflow.dto.response;

import java.time.Instant;
import java.util.UUID;

public record RecordingResponse(
        UUID id,
        UUID inputId,
        String fileName,
        String format,
        Integer durationSeconds,
        long fileSizeBytes,
        Instant createdAt
) {
}
