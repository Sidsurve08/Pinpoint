package com.execflow.controller;

import com.execflow.dto.request.UpdateTranscriptRequest;
import com.execflow.dto.response.TranscriptResponse;
import com.execflow.security.UserPrincipal;
import com.execflow.service.TranscriptionService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inputs/{inputId}")
public class TranscriptionController {

    private final TranscriptionService transcriptionService;

    public TranscriptionController(TranscriptionService transcriptionService) {
        this.transcriptionService = transcriptionService;
    }

    @PostMapping("/transcribe")
    public TranscriptResponse transcribe(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID inputId
    ) {
        return transcriptionService.transcribe(principal.getId(), inputId);
    }

    @GetMapping("/transcript")
    public TranscriptResponse getTranscript(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID inputId
    ) {
        return transcriptionService.getForUser(principal.getId(), inputId);
    }

    @PutMapping("/transcript")
    public TranscriptResponse updateTranscript(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID inputId,
            @Valid @RequestBody UpdateTranscriptRequest request
    ) {
        return transcriptionService.update(principal.getId(), inputId, request);
    }
}
