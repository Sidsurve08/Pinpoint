package com.execflow.controller;

import com.execflow.dto.response.DocumentResponse;
import com.execflow.dto.response.DocumentSummaryResponse;
import com.execflow.security.UserPrincipal;
import com.execflow.service.DocumentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/api/v1/inputs/{inputId}/documents/brief")
    public ResponseEntity<DocumentResponse> generateBrief(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID inputId
    ) {
        DocumentResponse response = documentService.generateBrief(principal.getId(), inputId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/api/v1/inputs/{inputId}/documents/notes")
    public ResponseEntity<DocumentResponse> generateNotes(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID inputId
    ) {
        DocumentResponse response = documentService.generateNotes(principal.getId(), inputId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/v1/documents")
    public List<DocumentSummaryResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        return documentService.list(principal.getId());
    }

    @GetMapping("/api/v1/documents/{id}")
    public DocumentResponse get(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id
    ) {
        return documentService.get(principal.getId(), id);
    }

    @DeleteMapping("/api/v1/documents/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id
    ) {
        documentService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
