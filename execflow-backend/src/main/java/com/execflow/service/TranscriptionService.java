package com.execflow.service;

import com.execflow.dto.request.UpdateTranscriptRequest;
import com.execflow.dto.response.TranscriptResponse;
import com.execflow.entity.*;
import com.execflow.exception.ApiException;
import com.execflow.exception.ResourceNotFoundException;
import com.execflow.mapper.TranscriptMapper;
import com.execflow.repository.InputRepository;
import com.execflow.repository.RecordingRepository;
import com.execflow.repository.TranscriptRepository;
import com.execflow.service.ai.TranscriptionClient;
import com.execflow.service.storage.StorageService;
import com.execflow.util.AudioFormats;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class TranscriptionService {

    private final InputRepository inputRepository;
    private final RecordingRepository recordingRepository;
    private final TranscriptRepository transcriptRepository;
    private final StorageService storageService;
    private final TranscriptionClient transcriptionClient;
    private final TranscriptMapper transcriptMapper;

    public TranscriptionService(
            InputRepository inputRepository,
            RecordingRepository recordingRepository,
            TranscriptRepository transcriptRepository,
            StorageService storageService,
            TranscriptionClient transcriptionClient,
            TranscriptMapper transcriptMapper
    ) {
        this.inputRepository = inputRepository;
        this.recordingRepository = recordingRepository;
        this.transcriptRepository = transcriptRepository;
        this.storageService = storageService;
        this.transcriptionClient = transcriptionClient;
        this.transcriptMapper = transcriptMapper;
    }

    @Transactional
    public TranscriptResponse transcribe(UUID userId, UUID inputId) {
        Input input = inputRepository.findByIdAndUserId(inputId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Input", inputId));

        if (input.getType() != InputType.VOICE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only VOICE inputs can be transcribed");
        }

        Recording recording = recordingRepository.findByInputId(inputId)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
                        "No recording is attached to this input yet"));

        Resource audio = storageService.load(recording.getStoragePath());
        String contentType = AudioFormats.contentTypeFor(recording.getFormat());

        // This call can take a while for longer recordings on CPU - the
        // WebClient timeout is configured generously for that reason.
        String text = transcriptionClient.transcribe(audio, recording.getFileName(), contentType);

        Transcript transcript = transcriptRepository.findByInputId(inputId)
                .map(existing -> {
                    existing.setContent(text);
                    existing.setSource(TranscriptSource.AI_GENERATED);
                    return existing;
                })
                .orElseGet(() -> Transcript.builder()
                        .inputId(inputId)
                        .content(text)
                        .source(TranscriptSource.AI_GENERATED)
                        .build());

        Transcript saved = transcriptRepository.save(transcript);

        input.setStatus(InputStatus.TRANSCRIBED);
        inputRepository.save(input);

        return transcriptMapper.toResponse(saved);
    }

    public TranscriptResponse getForUser(UUID userId, UUID inputId) {
        ensureOwned(userId, inputId);
        return transcriptMapper.toResponse(findOwnedTranscript(inputId));
    }

    @Transactional
    public TranscriptResponse update(UUID userId, UUID inputId, UpdateTranscriptRequest request) {
        ensureOwned(userId, inputId);
        Transcript transcript = findOwnedTranscript(inputId);
        transcript.setContent(request.content());
        transcript.setSource(TranscriptSource.MANUAL);
        return transcriptMapper.toResponse(transcriptRepository.save(transcript));
    }

    private void ensureOwned(UUID userId, UUID inputId) {
        inputRepository.findByIdAndUserId(inputId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Input", inputId));
    }

    private Transcript findOwnedTranscript(UUID inputId) {
        return transcriptRepository.findByInputId(inputId)
                .orElseThrow(() -> new ResourceNotFoundException("Transcript for input", inputId));
    }
}
