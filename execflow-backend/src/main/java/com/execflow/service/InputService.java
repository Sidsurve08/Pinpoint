package com.execflow.service;

import com.execflow.dto.request.CreateInputRequest;
import com.execflow.dto.response.InputResponse;
import com.execflow.entity.Input;
import com.execflow.entity.InputStatus;
import com.execflow.entity.InputType;
import com.execflow.exception.ApiException;
import com.execflow.exception.ResourceNotFoundException;
import com.execflow.mapper.InputMapper;
import com.execflow.repository.InputRepository;
import com.execflow.repository.ActionItemRepository;
import com.execflow.repository.AnalysisRepository;
import com.execflow.repository.DocumentRepository;
import com.execflow.repository.RecordingRepository;
import com.execflow.repository.TranscriptRepository;
import com.execflow.service.storage.StorageService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class InputService {

    private final InputRepository inputRepository;
    private final InputMapper inputMapper;
    private final RecordingRepository recordingRepository;
    private final TranscriptRepository transcriptRepository;
    private final AnalysisRepository analysisRepository;
    private final ActionItemRepository actionItemRepository;
    private final DocumentRepository documentRepository;
    private final StorageService storageService;

    public InputService(
            InputRepository inputRepository,
            InputMapper inputMapper,
            RecordingRepository recordingRepository,
            TranscriptRepository transcriptRepository,
            AnalysisRepository analysisRepository,
            ActionItemRepository actionItemRepository,
            DocumentRepository documentRepository,
            StorageService storageService
    ) {
        this.inputRepository = inputRepository;
        this.inputMapper = inputMapper;
        this.recordingRepository = recordingRepository;
        this.transcriptRepository = transcriptRepository;
        this.analysisRepository = analysisRepository;
        this.actionItemRepository = actionItemRepository;
        this.documentRepository = documentRepository;
        this.storageService = storageService;
    }

    @Transactional
    public InputResponse create(UUID userId, CreateInputRequest request) {
        if (request.type() == InputType.TEXT
                && (request.rawText() == null || request.rawText().isBlank())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "rawText is required for TEXT inputs");
        }

        Input input = Input.builder()
                .userId(userId)
                .type(request.type())
                .title(request.title().trim())
                // Only persist rawText for TEXT inputs - VOICE inputs get
                // their content from the Transcript entity in the
                // Transcription module, keeping the source of truth single.
                .rawText(request.type() == InputType.TEXT ? request.rawText() : null)
                .status(InputStatus.CREATED)
                .build();

        return inputMapper.toResponse(inputRepository.save(input));
    }

    public List<InputResponse> listForUser(UUID userId) {
        return inputRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(inputMapper::toResponse)
                .toList();
    }

    public InputResponse getForUser(UUID userId, UUID inputId) {
        return inputMapper.toResponse(findOwnedOrThrow(userId, inputId));
    }

    @Transactional
    public void deleteForUser(UUID userId, UUID inputId) {
        Input input = findOwnedOrThrow(userId, inputId);

        recordingRepository.findByInputId(inputId).ifPresent(recording -> {
            storageService.delete(recording.getStoragePath());
            recordingRepository.delete(recording);
        });
        transcriptRepository.deleteByInputId(inputId);

        analysisRepository.findByInputId(inputId).ifPresent(analysis -> {
            actionItemRepository.deleteAllByAnalysisId(analysis.getId());
            analysisRepository.delete(analysis);
        });
        documentRepository.deleteAllByInputId(inputId);

        inputRepository.delete(input);
    }

    private Input findOwnedOrThrow(UUID userId, UUID inputId) {
        return inputRepository.findByIdAndUserId(inputId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Input", inputId));
    }
}
