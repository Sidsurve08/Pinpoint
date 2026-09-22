package com.execflow.service;

import com.execflow.dto.ai.AiBriefNarrative;
import com.execflow.dto.ai.AiNotesNarrative;
import com.execflow.dto.response.ActionItemResponse;
import com.execflow.dto.response.AnalysisResponse;
import com.execflow.dto.response.DocumentContentPayload;
import com.execflow.dto.response.DocumentResponse;
import com.execflow.dto.response.DocumentSummaryResponse;
import com.execflow.entity.Document;
import com.execflow.entity.DocumentType;
import com.execflow.entity.Input;
import com.execflow.entity.InputType;
import com.execflow.entity.Transcript;
import com.execflow.exception.ApiException;
import com.execflow.exception.ResourceNotFoundException;
import com.execflow.mapper.DocumentMapper;
import com.execflow.repository.DocumentRepository;
import com.execflow.repository.InputRepository;
import com.execflow.repository.TranscriptRepository;
import com.execflow.service.ai.AiProviderService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    private final InputRepository inputRepository;
    private final TranscriptRepository transcriptRepository;
    private final DocumentRepository documentRepository;
    private final AnalysisService analysisService;
    private final AiProviderService aiProviderService;
    private final DocumentMapper documentMapper;

    public DocumentService(
            InputRepository inputRepository,
            TranscriptRepository transcriptRepository,
            DocumentRepository documentRepository,
            AnalysisService analysisService,
            AiProviderService aiProviderService,
            DocumentMapper documentMapper
    ) {
        this.inputRepository = inputRepository;
        this.transcriptRepository = transcriptRepository;
        this.documentRepository = documentRepository;
        this.analysisService = analysisService;
        this.aiProviderService = aiProviderService;
        this.documentMapper = documentMapper;
    }

    @Transactional
    public DocumentResponse generateBrief(UUID userId, UUID inputId) {
        Input input = ownedInput(userId, inputId);
        AnalysisResponse analysis = analysisService.getForUser(userId, inputId);
        String sourceText = resolveSourceText(input);
        String context = buildAnalysisContext(analysis);

        AiBriefNarrative narrative = aiProviderService.generateBriefNarrative(sourceText, context);

        DocumentContentPayload payload = new DocumentContentPayload(
                nonBlank(narrative.title(), input.getTitle() + " - Executive Brief"),
                analysis.executiveSummary(),
                narrative.background(),
                narrative.currentSituation(),
                analysis.keyPoints(),
                analysis.decisions(),
                analysis.risks(),
                analysis.opportunities(),
                narrative.recommendations(),
                narrative.nextSteps() == null ? List.of() : narrative.nextSteps(),
                null,
                List.of(),
                List.of()
        );

        return persist(userId, input, analysis, DocumentType.BRIEF, payload);
    }

    @Transactional
    public DocumentResponse generateNotes(UUID userId, UUID inputId) {
        Input input = ownedInput(userId, inputId);
        AnalysisResponse analysis = analysisService.getForUser(userId, inputId);
        String sourceText = resolveSourceText(input);
        String context = buildAnalysisContext(analysis);

        AiNotesNarrative narrative = aiProviderService.generateNotesNarrative(sourceText, context);

        DocumentContentPayload payload = new DocumentContentPayload(
                nonBlank(narrative.title(), input.getTitle() + " - Meeting Notes"),
                analysis.executiveSummary(),
                null,
                null,
                analysis.keyPoints(),
                analysis.decisions(),
                List.of(),
                List.of(),
                null,
                narrative.nextSteps() == null ? List.of() : narrative.nextSteps(),
                narrative.context(),
                analysis.followUps(),
                analysis.actionItems()
        );

        return persist(userId, input, analysis, DocumentType.NOTES, payload);
    }

    public List<DocumentSummaryResponse> list(UUID userId) {
        return documentRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(documentMapper::toSummary)
                .toList();
    }

    public DocumentResponse get(UUID userId, UUID documentId) {
        Document document = documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", documentId));
        return documentMapper.toResponse(document);
    }

    @Transactional
    public void delete(UUID userId, UUID documentId) {
        Document document = documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", documentId));
        documentRepository.delete(document);
    }

    private DocumentResponse persist(
            UUID userId, Input input, AnalysisResponse analysis, DocumentType type, DocumentContentPayload payload
    ) {
        Document document = Document.builder()
                .userId(userId)
                .inputId(input.getId())
                .analysisId(analysis.id())
                .type(type)
                .title(payload.title())
                .contentJson(documentMapper.writePayload(payload))
                .build();

        return documentMapper.toResponse(documentRepository.save(document));
    }

    private Input ownedInput(UUID userId, UUID inputId) {
        return inputRepository.findByIdAndUserId(inputId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Input", inputId));
    }

    private String resolveSourceText(Input input) {
        if (input.getType() == InputType.TEXT) {
            return input.getRawText();
        }
        return transcriptRepository.findByInputId(input.getId())
                .map(Transcript::getContent)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
                        "This recording hasn't been transcribed yet"));
    }

    /** A plain-text digest of the already-extracted analysis, so the narrative call doesn't have to re-derive it. */
    private String buildAnalysisContext(AnalysisResponse analysis) {
        StringBuilder sb = new StringBuilder();
        sb.append("Executive Summary: ").append(analysis.executiveSummary()).append("\n\n");
        appendList(sb, "Key Points", analysis.keyPoints());
        appendList(sb, "Decisions", analysis.decisions());
        appendList(sb, "Risks", analysis.risks());
        appendList(sb, "Opportunities", analysis.opportunities());
        appendList(sb, "Follow-ups", analysis.followUps());

        if (analysis.actionItems() != null && !analysis.actionItems().isEmpty()) {
            sb.append("Action Items:\n");
            for (ActionItemResponse item : analysis.actionItems()) {
                sb.append("- ").append(item.title());
                if (item.owner() != null) sb.append(" (Owner: ").append(item.owner()).append(")");
                if (item.deadline() != null) sb.append(" (Due: ").append(item.deadline()).append(")");
                sb.append("\n");
            }
        }
        return sb.toString();
    }

    private void appendList(StringBuilder sb, String label, List<String> items) {
        if (items == null || items.isEmpty()) return;
        sb.append(label).append(":\n");
        items.forEach(i -> sb.append("- ").append(i).append("\n"));
        sb.append("\n");
    }

    private String nonBlank(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value;
    }
}
