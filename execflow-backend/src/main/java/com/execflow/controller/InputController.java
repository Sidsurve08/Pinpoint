package com.execflow.controller;

import com.execflow.dto.request.CreateInputRequest;
import com.execflow.dto.response.InputResponse;
import com.execflow.security.UserPrincipal;
import com.execflow.service.InputService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inputs")
public class InputController {

    private final InputService inputService;

    public InputController(InputService inputService) {
        this.inputService = inputService;
    }

    @PostMapping
    public ResponseEntity<InputResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateInputRequest request
    ) {
        InputResponse response = inputService.create(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<InputResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        return inputService.listForUser(principal.getId());
    }

    @GetMapping("/{id}")
    public InputResponse getOne(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id
    ) {
        return inputService.getForUser(principal.getId(), id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id
    ) {
        inputService.deleteForUser(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
