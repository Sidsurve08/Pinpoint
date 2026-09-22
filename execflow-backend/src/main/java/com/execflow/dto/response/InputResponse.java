package com.execflow.dto.response;

import com.execflow.entity.InputStatus;
import com.execflow.entity.InputType;

import java.time.Instant;
import java.util.UUID;

public record InputResponse(
        UUID id,
        InputType type,
        String title,
        String rawText,
        InputStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}
