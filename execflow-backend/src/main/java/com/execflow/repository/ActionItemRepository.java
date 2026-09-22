package com.execflow.repository;

import com.execflow.entity.ActionItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ActionItemRepository extends JpaRepository<ActionItem, UUID> {

    List<ActionItem> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

    List<ActionItem> findAllByAnalysisIdOrderByCreatedAtAsc(UUID analysisId);

    Optional<ActionItem> findByIdAndUserId(UUID id, UUID userId);

    void deleteAllByAnalysisId(UUID analysisId);

    long countByUserId(UUID userId);
}
