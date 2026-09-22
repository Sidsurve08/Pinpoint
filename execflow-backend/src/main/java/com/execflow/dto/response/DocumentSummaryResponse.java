package com.execflow.dto.response;

import com.execflow.entity.DocumentType;

import java.time.Instant;
import java.util.UUID;

public record DocumentSummaryResponse(
        UUID id,
        UUID inputId,
        DocumentType type,
        String title,
        Instant createdAt,
        Instant updatedAt
) {
}
