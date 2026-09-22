package com.execflow.dto.request;

import com.execflow.entity.ActionStatus;
import com.execflow.entity.Priority;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record CreateActionItemRequest(

        @NotBlank(message = "Title is required")
        String title,

        String description,
        String owner,
        LocalDate deadline,

        /** Defaults to MEDIUM if omitted. */
        Priority priority,

        /** Defaults to PENDING if omitted. */
        ActionStatus status
) {
}
