package com.execflow.mapper;

import com.execflow.dto.response.DocumentContentPayload;
import com.execflow.dto.response.DocumentResponse;
import com.execflow.dto.response.DocumentSummaryResponse;
import com.execflow.entity.Document;
import com.execflow.exception.ApiException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class DocumentMapper {

    private final ObjectMapper objectMapper;

    public DocumentMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public DocumentSummaryResponse toSummary(Document document) {
        return new DocumentSummaryResponse(
                document.getId(),
                document.getInputId(),
                document.getType(),
                document.getTitle(),
                document.getCreatedAt(),
                document.getUpdatedAt()
        );
    }

    public DocumentResponse toResponse(Document document) {
        DocumentContentPayload content = readPayload(document.getContentJson());

        return new DocumentResponse(
                document.getId(),
                document.getInputId(),
                document.getAnalysisId(),
                document.getType(),
                document.getTitle(),
                content.executiveSummary(),
                content.background(),
                content.currentSituation(),
                content.keyPoints(),
                content.decisions(),
                content.risks(),
                content.opportunities(),
                content.recommendations(),
                content.nextSteps(),
                content.context(),
                content.followUps(),
                content.actionItems(),
                document.getCreatedAt(),
                document.getUpdatedAt()
        );
    }

    public String writePayload(DocumentContentPayload payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save generated document");
        }
    }

    private DocumentContentPayload readPayload(String json) {
        try {
            return objectMapper.readValue(json, DocumentContentPayload.class);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read stored document content");
        }
    }
}
