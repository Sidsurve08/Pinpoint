package com.execflow.controller;

import com.execflow.dto.request.CreateActionItemRequest;
import com.execflow.dto.request.UpdateActionItemRequest;
import com.execflow.dto.request.UpdateActionStatusRequest;
import com.execflow.dto.response.ActionItemResponse;
import com.execflow.entity.ActionStatus;
import com.execflow.entity.Priority;
import com.execflow.security.UserPrincipal;
import com.execflow.service.ActionItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/actions")
public class ActionItemController {

    private final ActionItemService actionItemService;

    public ActionItemController(ActionItemService actionItemService) {
        this.actionItemService = actionItemService;
    }

    @GetMapping
    public List<ActionItemResponse> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) ActionStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Boolean overdue
    ) {
        return actionItemService.list(principal.getId(), status, priority, overdue);
    }

    @PostMapping
    public ResponseEntity<ActionItemResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateActionItemRequest request
    ) {
        ActionItemResponse response = actionItemService.create(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ActionItemResponse update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateActionItemRequest request
    ) {
        return actionItemService.update(principal.getId(), id, request);
    }

    @PatchMapping("/{id}/status")
    public ActionItemResponse updateStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateActionStatusRequest request
    ) {
        return actionItemService.updateStatus(principal.getId(), id, request.status());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id
    ) {
        actionItemService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
