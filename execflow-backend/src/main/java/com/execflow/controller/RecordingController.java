package com.execflow.controller;

import com.execflow.dto.response.RecordingResponse;
import com.execflow.security.UserPrincipal;
import com.execflow.service.RecordingService;
import com.execflow.util.AudioFormats;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inputs/{inputId}/recording")
public class RecordingController {

    private final RecordingService recordingService;

    public RecordingController(RecordingService recordingService) {
        this.recordingService = recordingService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public RecordingResponse upload(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID inputId,
            @RequestParam("file") MultipartFile file
    ) {
        return recordingService.upload(principal.getId(), inputId, file);
    }

    @GetMapping
    public RecordingResponse getMetadata(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID inputId
    ) {
        return recordingService.getMetadata(principal.getId(), inputId);
    }

    @GetMapping("/download")
    public ResponseEntity<Resource> download(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID inputId
    ) {
        RecordingService.LoadedRecording loaded = recordingService.download(principal.getId(), inputId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(AudioFormats.contentTypeFor(loaded.format())))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename(loaded.fileName()).build().toString())
                .body(loaded.resource());
    }
}
