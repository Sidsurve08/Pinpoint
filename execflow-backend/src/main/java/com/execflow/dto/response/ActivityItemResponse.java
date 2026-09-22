package com.execflow.dto.response;

import java.time.Instant;

public record ActivityItemResponse(
        String type,
        String title,
        String description,
        Instant timestamp
) {
}
