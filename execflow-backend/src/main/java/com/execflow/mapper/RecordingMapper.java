package com.execflow.mapper;

import com.execflow.dto.response.RecordingResponse;
import com.execflow.entity.Recording;
import org.springframework.stereotype.Component;

@Component
public class RecordingMapper {

    public RecordingResponse toResponse(Recording recording) {
        return new RecordingResponse(
                recording.getId(),
                recording.getInputId(),
                recording.getFileName(),
                recording.getFormat(),
                recording.getDurationSeconds(),
                recording.getFileSizeBytes(),
                recording.getCreatedAt()
        );
    }
}
