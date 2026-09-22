package com.execflow.mapper;

import com.execflow.dto.response.InputResponse;
import com.execflow.entity.Input;
import org.springframework.stereotype.Component;

@Component
public class InputMapper {

    public InputResponse toResponse(Input input) {
        return new InputResponse(
                input.getId(),
                input.getType(),
                input.getTitle(),
                input.getRawText(),
                input.getStatus(),
                input.getCreatedAt(),
                input.getUpdatedAt()
        );
    }
}
