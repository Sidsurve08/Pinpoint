package com.execflow.repository;

import com.execflow.entity.Input;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InputRepository extends JpaRepository<Input, UUID> {

    List<Input> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Input> findByIdAndUserId(UUID id, UUID userId);

    long countByUserId(UUID userId);
}
