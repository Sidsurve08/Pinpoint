package com.execflow.mapper;

import com.execflow.dto.response.ActionItemResponse;
import com.execflow.entity.ActionItem;
import com.execflow.entity.ActionStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class ActionItemMapper {

    public ActionItemResponse toResponse(ActionItem item) {
        return toResponse(item, null);
    }

    public ActionItemResponse toResponse(ActionItem item, String sourceTitle) {
        boolean overdue = item.getDeadline() != null
                && item.getStatus() != ActionStatus.COMPLETED
                && item.getDeadline().isBefore(LocalDate.now());

        return new ActionItemResponse(
                item.getId(),
                item.getTitle(),
                item.getDescription(),
                item.getOwner(),
                item.getDeadline(),
                item.getPriority(),
                item.getStatus(),
                overdue,
                sourceTitle,
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
