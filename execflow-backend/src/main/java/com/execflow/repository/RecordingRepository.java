package com.execflow.repository;

import com.execflow.entity.Recording;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RecordingRepository extends JpaRepository<Recording, UUID> {

    Optional<Recording> findByInputId(UUID inputId);

    void deleteByInputId(UUID inputId);
}
