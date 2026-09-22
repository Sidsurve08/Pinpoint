package com.execflow.dto.request;

import com.execflow.entity.ActionStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateActionStatusRequest(

        @NotNull(message = "Status is required")
        ActionStatus status
) {
}
