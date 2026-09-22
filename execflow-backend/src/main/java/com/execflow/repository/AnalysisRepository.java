package com.execflow.repository;

import com.execflow.entity.Analysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AnalysisRepository extends JpaRepository<Analysis, UUID> {

    Optional<Analysis> findByInputId(UUID inputId);

    void deleteByInputId(UUID inputId);
}
