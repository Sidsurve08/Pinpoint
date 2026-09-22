package com.execflow.service;

import com.execflow.dto.ai.AiActionItem;
import com.execflow.dto.ai.AiAnalysisResult;
import com.execflow.dto.response.AnalysisResponse;
import com.execflow.entity.*;
import com.execflow.exception.ApiException;
import com.execflow.exception.ResourceNotFoundException;
import com.execflow.mapper.AnalysisMapper;
import com.execflow.repository.*;
import com.execflow.service.ai.AiProviderService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;

@Service
public class AnalysisService {

    private final InputRepository inputRepository;
    private final TranscriptRepository transcriptRepository;
    private final AnalysisRepository analysisRepository;
    private final ActionItemRepository actionItemRepository;
    private final AiProviderService aiProviderService;
    private final AnalysisMapper analysisMapper;

    public AnalysisService(
            InputRepository inputRepository,
            TranscriptRepository transcriptRepository,
            AnalysisRepository analysisRepository,
            ActionItemRepository actionItemRepository,
            AiProviderService aiProviderService,
            AnalysisMapper analysisMapper
    ) {
        this.inputRepository = inputRepository;
        this.transcriptRepository = transcriptRepository;
        this.analysisRepository = analysisRepository;
        this.actionItemRepository = actionItemRepository;
        this.aiProviderService = aiProviderService;
        this.analysisMapper = analysisMapper;
    }

    @Transactional
    public AnalysisResponse analyze(UUID userId, UUID inputId) {
        Input input = inputRepository.findByIdAndUserId(inputId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Input", inputId));

        String sourceText = resolveSourceText(input);

        AiAnalysisResult result = aiProviderService.analyze(sourceText);

        Analysis analysis = analysisRepository.findByInputId(inputId)
                .orElseGet(() -> Analysis.builder().inputId(inputId).build());

        analysis.setExecutiveSummary(nullToEmpty(result.executiveSummary()));
        analysis.setKeyPointsJson(analysisMapper.writeList(result.keyPoints()));
        analysis.setDecisionsJson(analysisMapper.writeList(result.decisions()));
        analysis.setRisksJson(analysisMapper.writeList(result.risks()));
        analysis.setOpportunitiesJson(analysisMapper.writeList(result.opportunities()));
        analysis.setFollowUpsJson(analysisMapper.writeList(result.followUps()));
        analysis.setImportantInformationJson(analysisMapper.writeList(result.importantInformation()));

        Analysis savedAnalysis = analysisRepository.save(analysis);

        // Regenerating replaces the previously extracted action items rather
        // than accumulating duplicates. Manually created action items are
        // untouched since they carry analysisId=null.
        actionItemRepository.deleteAllByAnalysisId(savedAnalysis.getId());

        List<ActionItem> actionItems = (result.actionItems() == null ? List.<AiActionItem>of() : result.actionItems())
                .stream()
                .map(ai -> toActionItem(userId, savedAnalysis.getId(), ai))
                .toList();
        actionItemRepository.saveAll(actionItems);

        input.setStatus(InputStatus.ANALYZED);
        inputRepository.save(input);

        return analysisMapper.toResponse(
                savedAnalysis,
                actionItemRepository.findAllByAnalysisIdOrderByCreatedAtAsc(savedAnalysis.getId())
        );
    }

    public AnalysisResponse getForUser(UUID userId, UUID inputId) {
        inputRepository.findByIdAndUserId(inputId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Input", inputId));

        Analysis analysis = analysisRepository.findByInputId(inputId)
                .orElseThrow(() -> new ResourceNotFoundException("Analysis for input", inputId));

        return analysisMapper.toResponse(
                analysis,
                actionItemRepository.findAllByAnalysisIdOrderByCreatedAtAsc(analysis.getId())
        );
    }

    private String resolveSourceText(Input input) {
        if (input.getType() == InputType.TEXT) {
            if (input.getRawText() == null || input.getRawText().isBlank()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "This input has no text to analyze");
            }
            return input.getRawText();
        }

        // VOICE - must be transcribed first.
        return transcriptRepository.findByInputId(input.getId())
                .map(Transcript::getContent)
                .filter(content -> !content.isBlank())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
                        "This recording hasn't been transcribed yet. Transcribe it before analyzing."));
    }

    private ActionItem toActionItem(UUID userId, UUID analysisId, AiActionItem ai) {
        return ActionItem.builder()
                .userId(userId)
                .analysisId(analysisId)
                .title(nullToEmpty(ai.title()))
                .description(ai.description())
                .owner(blankToNull(ai.owner()))
                .deadline(parseDeadline(ai.deadline()))
                .priority(parsePriority(ai.priority()))
                .status(ActionStatus.PENDING)
                .build();
    }

    private LocalDate parseDeadline(String raw) {
        if (raw == null || raw.isBlank()) return null;
        try {
            return LocalDate.parse(raw.trim());
        } catch (DateTimeParseException e) {
            // The model didn't follow the ISO-8601 instruction - dropping
            // the date is safer than crashing the whole analysis over it.
            return null;
        }
    }

    private Priority parsePriority(String raw) {
        if (raw == null) return Priority.MEDIUM;
        try {
            return Priority.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return Priority.MEDIUM;
        }
    }

    private String nullToEmpty(String s) {
        return s == null ? "" : s;
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
