package com.execflow.dto.request;

import com.execflow.entity.ActionStatus;
import com.execflow.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record UpdateActionItemRequest(

        @NotBlank(message = "Title is required")
        String title,

        String description,
        String owner,
        LocalDate deadline,

        @NotNull(message = "Priority is required")
        Priority priority,

        @NotNull(message = "Status is required")
        ActionStatus status
) {
}
