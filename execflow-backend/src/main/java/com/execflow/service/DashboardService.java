package com.execflow.service;

import com.execflow.dto.response.ActionItemResponse;
import com.execflow.dto.response.ActivityItemResponse;
import com.execflow.dto.response.DashboardSummaryResponse;
import com.execflow.dto.response.InputResponse;
import com.execflow.entity.ActionItem;
import com.execflow.entity.ActionStatus;
import com.execflow.entity.Document;
import com.execflow.entity.DocumentType;
import com.execflow.entity.Input;
import com.execflow.entity.InputStatus;
import com.execflow.entity.InputType;
import com.execflow.entity.Priority;
import com.execflow.mapper.ActionItemMapper;
import com.execflow.mapper.InputMapper;
import com.execflow.repository.ActionItemRepository;
import com.execflow.repository.DocumentRepository;
import com.execflow.repository.InputRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class DashboardService {

    private static final int RECENT_INPUTS_LIMIT = 5;
    private static final int PRIORITY_ACTIONS_LIMIT = 5;
    private static final int ACTIVITY_LIMIT = 8;

    private final InputRepository inputRepository;
    private final ActionItemRepository actionItemRepository;
    private final DocumentRepository documentRepository;
    private final InputMapper inputMapper;
    private final ActionItemMapper actionItemMapper;

    public DashboardService(
            InputRepository inputRepository,
            ActionItemRepository actionItemRepository,
            DocumentRepository documentRepository,
            InputMapper inputMapper,
            ActionItemMapper actionItemMapper
    ) {
        this.inputRepository = inputRepository;
        this.actionItemRepository = actionItemRepository;
        this.documentRepository = documentRepository;
        this.inputMapper = inputMapper;
        this.actionItemMapper = actionItemMapper;
    }

    public DashboardSummaryResponse getSummary(UUID userId) {
        List<Input> inputs = inputRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
        List<ActionItem> actions = actionItemRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
        LocalDate today = LocalDate.now();

        long pending = actions.stream().filter(a -> a.getStatus() == ActionStatus.PENDING).count();
        long inProgress = actions.stream().filter(a -> a.getStatus() == ActionStatus.IN_PROGRESS).count();
        long completed = actions.stream().filter(a -> a.getStatus() == ActionStatus.COMPLETED).count();
        long overdue = actions.stream()
                .filter(a -> a.getStatus() != ActionStatus.COMPLETED)
                .filter(a -> a.getDeadline() != null && a.getDeadline().isBefore(today))
                .count();

        List<InputResponse> recentInputs = inputs.stream()
                .limit(RECENT_INPUTS_LIMIT)
                .map(inputMapper::toResponse)
                .toList();

        List<ActionItemResponse> priorityActions = actions.stream()
                .filter(a -> a.getStatus() != ActionStatus.COMPLETED)
                .sorted(
                        Comparator.comparingInt((ActionItem a) -> priorityRank(a.getPriority())).reversed()
                                .thenComparing(a -> a.getDeadline() == null ? LocalDate.MAX : a.getDeadline())
                )
                .limit(PRIORITY_ACTIONS_LIMIT)
                .map(actionItemMapper::toResponse)
                .toList();

        List<ActivityItemResponse> recentActivity = buildActivity(userId, inputs);

        return new DashboardSummaryResponse(
                inputs.size(), pending, inProgress, completed, overdue,
                recentInputs, priorityActions, recentActivity
        );
    }

    private int priorityRank(Priority priority) {
        return switch (priority) {
            case URGENT -> 3;
            case HIGH -> 2;
            case MEDIUM -> 1;
            case LOW -> 0;
        };
    }

    /**
     * There's no dedicated activity-log table in v1 - that's more
     * infrastructure than a single-user app needs. Instead this reads the
     * timestamps that already exist (Input.createdAt, Input.updatedAt when
     * it flips to ANALYZED, Document.createdAt) and merges them into a feed.
     * It's an approximation (e.g. TRANSCRIBED and ANALYZED both touch
     * updatedAt) but accurate for what it claims to show.
     */
    private List<ActivityItemResponse> buildActivity(UUID userId, List<Input> inputs) {
        List<ActivityItemResponse> items = new ArrayList<>();

        for (Input input : inputs) {
            items.add(new ActivityItemResponse(
                    "INPUT_LOGGED",
                    "New Input Logged",
                    "\"" + input.getTitle() + "\" was added as "
                            + (input.getType() == InputType.VOICE ? "a voice note" : "text"),
                    input.getCreatedAt()
            ));

            if (input.getStatus() == InputStatus.ANALYZED) {
                items.add(new ActivityItemResponse(
                        "INPUT_ANALYZED",
                        "Input Analyzed",
                        "Analysis completed for \"" + input.getTitle() + "\"",
                        input.getUpdatedAt()
                ));
            }
        }

        for (Document document : documentRepository.findAllByUserIdOrderByCreatedAtDesc(userId)) {
            boolean isBrief = document.getType() == DocumentType.BRIEF;
            items.add(new ActivityItemResponse(
                    isBrief ? "BRIEF_GENERATED" : "NOTES_GENERATED",
                    isBrief ? "Brief Generated" : "Notes Generated",
                    "\"" + document.getTitle() + "\" is ready for review",
                    document.getCreatedAt()
            ));
        }

        return items.stream()
                .sorted(Comparator.comparing(ActivityItemResponse::timestamp).reversed())
                .limit(ACTIVITY_LIMIT)
                .toList();
    }
}
