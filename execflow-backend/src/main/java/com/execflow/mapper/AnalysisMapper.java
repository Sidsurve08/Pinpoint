package com.execflow.mapper;

import com.execflow.dto.response.ActionItemResponse;
import com.execflow.dto.response.AnalysisResponse;
import com.execflow.entity.Analysis;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AnalysisMapper {

    private final ObjectMapper objectMapper;
    private final ActionItemMapper actionItemMapper;

    public AnalysisMapper(ObjectMapper objectMapper, ActionItemMapper actionItemMapper) {
        this.objectMapper = objectMapper;
        this.actionItemMapper = actionItemMapper;
    }

    public AnalysisResponse toResponse(Analysis analysis, List<com.execflow.entity.ActionItem> actionItems) {
        List<ActionItemResponse> actionItemResponses = actionItems.stream()
                .map(actionItemMapper::toResponse)
                .toList();

        return new AnalysisResponse(
                analysis.getId(),
                analysis.getInputId(),
                analysis.getExecutiveSummary(),
                readList(analysis.getKeyPointsJson()),
                readList(analysis.getDecisionsJson()),
                readList(analysis.getRisksJson()),
                readList(analysis.getOpportunitiesJson()),
                readList(analysis.getFollowUpsJson()),
                readList(analysis.getImportantInformationJson()),
                actionItemResponses,
                analysis.getCreatedAt(),
                analysis.getUpdatedAt()
        );
    }

    public String writeList(List<String> values) {
        try {
            return objectMapper.writeValueAsString(values == null ? List.of() : values);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private List<String> readList(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {
            });
        } catch (Exception e) {
            return List.of();
        }
    }
}
