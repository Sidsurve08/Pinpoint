package com.execflow.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "recordings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recording {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "input_id", nullable = false, unique = true)
    private UUID inputId;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    /** Path relative to the configured storage base-path, not an absolute path. */
    @Column(name = "storage_path", nullable = false)
    private String storagePath;

    @Column(nullable = false, length = 10)
    private String format;

    /** Populated once the Transcription module computes it; null until then. */
    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "file_size_bytes", nullable = false)
    private long fileSizeBytes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
