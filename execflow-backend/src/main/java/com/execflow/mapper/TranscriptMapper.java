package com.execflow.mapper;

import com.execflow.dto.response.TranscriptResponse;
import com.execflow.entity.Transcript;
import org.springframework.stereotype.Component;

@Component
public class TranscriptMapper {

    public TranscriptResponse toResponse(Transcript transcript) {
        return new TranscriptResponse(
                transcript.getId(),
                transcript.getInputId(),
                transcript.getContent(),
                transcript.getSource(),
                transcript.getCreatedAt(),
                transcript.getUpdatedAt()
        );
    }
}
