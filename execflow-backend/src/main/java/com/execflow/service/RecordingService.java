package com.execflow.service;

import com.execflow.dto.response.RecordingResponse;
import com.execflow.entity.Input;
import com.execflow.entity.InputType;
import com.execflow.entity.Recording;
import com.execflow.exception.ApiException;
import com.execflow.exception.ResourceNotFoundException;
import com.execflow.mapper.RecordingMapper;
import com.execflow.repository.InputRepository;
import com.execflow.repository.RecordingRepository;
import com.execflow.service.storage.StorageService;
import com.execflow.util.AudioFormats;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
public class RecordingService {

    private final InputRepository inputRepository;
    private final RecordingRepository recordingRepository;
    private final StorageService storageService;
    private final RecordingMapper recordingMapper;

    public RecordingService(
            InputRepository inputRepository,
            RecordingRepository recordingRepository,
            StorageService storageService,
            RecordingMapper recordingMapper
    ) {
        this.inputRepository = inputRepository;
        this.recordingRepository = recordingRepository;
        this.storageService = storageService;
        this.recordingMapper = recordingMapper;
    }

    @Transactional
    public RecordingResponse upload(UUID userId, UUID inputId, MultipartFile file) {
        Input input = inputRepository.findByIdAndUserId(inputId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Input", inputId));

        if (input.getType() != InputType.VOICE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Recordings can only be attached to VOICE inputs");
        }

        String extension = extractExtension(file.getOriginalFilename());
        if (!AudioFormats.isAllowed(extension)) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Unsupported audio format. Allowed: " + AudioFormats.ALLOWED_EXTENSIONS);
        }

        // Re-uploading (e.g. "Re-record") replaces the previous file rather
        // than accumulating orphans, both on disk and in the database.
        recordingRepository.findByInputId(inputId).ifPresent(existing -> {
            storageService.delete(existing.getStoragePath());
            recordingRepository.delete(existing);
        });

        String subdirectory = userId + "/" + inputId;
        StorageService.StoredFile stored = storageService.store(file, subdirectory);

        Recording recording = Recording.builder()
                .inputId(inputId)
                .fileName(stored.originalFileName())
                .storagePath(stored.storagePath())
                .format(extension.toLowerCase())
                .fileSizeBytes(stored.sizeBytes())
                .build();

        Recording saved = recordingRepository.save(recording);
        return recordingMapper.toResponse(saved);
    }

    public RecordingResponse getMetadata(UUID userId, UUID inputId) {
        return recordingMapper.toResponse(findOwnedRecording(userId, inputId));
    }

    public LoadedRecording download(UUID userId, UUID inputId) {
        Recording recording = findOwnedRecording(userId, inputId);
        Resource resource = storageService.load(recording.getStoragePath());
        return new LoadedRecording(resource, recording.getFileName(), recording.getFormat());
    }

    private Recording findOwnedRecording(UUID userId, UUID inputId) {
        // Ownership is enforced by first confirming the input belongs to
        // this user, then looking up its recording - a recording has no
        // userId of its own by design (it's owned via its Input).
        inputRepository.findByIdAndUserId(inputId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Input", inputId));

        return recordingRepository.findByInputId(inputId)
                .orElseThrow(() -> new ResourceNotFoundException("Recording for input", inputId));
    }

    private String extractExtension(String fileName) {
        if (fileName == null) return "";
        int dot = fileName.lastIndexOf('.');
        return dot >= 0 && dot < fileName.length() - 1 ? fileName.substring(dot + 1) : "";
    }

    public record LoadedRecording(Resource resource, String fileName, String format) {
    }
}
