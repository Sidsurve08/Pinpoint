package com.execflow.service;

import com.execflow.dto.request.CreateActionItemRequest;
import com.execflow.dto.request.UpdateActionItemRequest;
import com.execflow.dto.response.ActionItemResponse;
import com.execflow.entity.ActionItem;
import com.execflow.entity.ActionStatus;
import com.execflow.entity.Analysis;
import com.execflow.entity.Priority;
import com.execflow.exception.ResourceNotFoundException;
import com.execflow.mapper.ActionItemMapper;
import com.execflow.repository.ActionItemRepository;
import com.execflow.repository.AnalysisRepository;
import com.execflow.repository.InputRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ActionItemService {

    private final ActionItemRepository actionItemRepository;
    private final AnalysisRepository analysisRepository;
    private final InputRepository inputRepository;
    private final ActionItemMapper actionItemMapper;

    public ActionItemService(
            ActionItemRepository actionItemRepository,
            AnalysisRepository analysisRepository,
            InputRepository inputRepository,
            ActionItemMapper actionItemMapper
    ) {
        this.actionItemRepository = actionItemRepository;
        this.analysisRepository = analysisRepository;
        this.inputRepository = inputRepository;
        this.actionItemMapper = actionItemMapper;
    }

    @Transactional
    public ActionItemResponse create(UUID userId, CreateActionItemRequest request) {
        ActionItem item = ActionItem.builder()
                .userId(userId)
                .analysisId(null) // manually created - not tied to an AI analysis
                .title(request.title().trim())
                .description(request.description())
                .owner(blankToNull(request.owner()))
                .deadline(request.deadline())
                .priority(request.priority() != null ? request.priority() : Priority.MEDIUM)
                .status(request.status() != null ? request.status() : ActionStatus.PENDING)
                .build();

        return actionItemMapper.toResponse(actionItemRepository.save(item));
    }

    /**
     * Lists a user's action items, optionally filtered. "overdue=true" is a
     * computed filter (deadline passed and not completed) rather than a
     * stored status, matching the tracker's "Overdue" tab being independent
     * of the actual Pending/In Progress/Completed status.
     */
    public List<ActionItemResponse> list(UUID userId, ActionStatus status, Priority priority, Boolean overdue) {
        List<ActionItem> items = actionItemRepository.findAllByUserIdOrderByCreatedAtDesc(userId);

        Map<UUID, String> sourceTitleByAnalysisId = resolveSourceTitles(items);

        LocalDate today = LocalDate.now();
        return items.stream()
                .filter(i -> status == null || i.getStatus() == status)
                .filter(i -> priority == null || i.getPriority() == priority)
                .filter(i -> overdue == null || !overdue || isOverdue(i, today))
                .map(i -> actionItemMapper.toResponse(
                        i,
                        i.getAnalysisId() == null ? null : sourceTitleByAnalysisId.get(i.getAnalysisId())
                ))
                .toList();
    }

    @Transactional
    public ActionItemResponse update(UUID userId, UUID id, UpdateActionItemRequest request) {
        ActionItem item = findOwnedOrThrow(userId, id);
        item.setTitle(request.title().trim());
        item.setDescription(request.description());
        item.setOwner(blankToNull(request.owner()));
        item.setDeadline(request.deadline());
        item.setPriority(request.priority());
        item.setStatus(request.status());
        return actionItemMapper.toResponse(actionItemRepository.save(item));
    }

    @Transactional
    public ActionItemResponse updateStatus(UUID userId, UUID id, ActionStatus status) {
        ActionItem item = findOwnedOrThrow(userId, id);
        item.setStatus(status);
        return actionItemMapper.toResponse(actionItemRepository.save(item));
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        ActionItem item = findOwnedOrThrow(userId, id);
        actionItemRepository.delete(item);
    }

    private boolean isOverdue(ActionItem item, LocalDate today) {
        return item.getDeadline() != null
                && item.getStatus() != ActionStatus.COMPLETED
                && item.getDeadline().isBefore(today);
    }

    private ActionItem findOwnedOrThrow(UUID userId, UUID id) {
        return actionItemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Action item", id));
    }

    /**
     * Batch-resolves analysisId -> source input title in two extra queries
     * total (not one per item), for AI-extracted action items only.
     */
    private Map<UUID, String> resolveSourceTitles(List<ActionItem> items) {
        Set<UUID> analysisIds = items.stream()
                .map(ActionItem::getAnalysisId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (analysisIds.isEmpty()) {
            return Map.of();
        }

        Map<UUID, UUID> analysisIdToInputId = analysisRepository.findAllById(analysisIds).stream()
                .collect(Collectors.toMap(Analysis::getId, Analysis::getInputId));

        Map<UUID, String> inputIdToTitle = inputRepository.findAllById(new HashSet<>(analysisIdToInputId.values()))
                .stream()
                .collect(Collectors.toMap(com.execflow.entity.Input::getId, com.execflow.entity.Input::getTitle));

        Map<UUID, String> result = new HashMap<>();
        analysisIdToInputId.forEach((analysisId, inputId) ->
                result.put(analysisId, inputIdToTitle.get(inputId)));
        return result;
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
