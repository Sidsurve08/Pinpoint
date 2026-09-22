package com.execflow.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "analyses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Analysis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "input_id", nullable = false, unique = true)
    private UUID inputId;

    @Column(name = "executive_summary", nullable = false, columnDefinition = "TEXT")
    private String executiveSummary;

    // Each of these holds a JSON array string, e.g. ["point one", "point two"].
    // Parsed into List<String> by AnalysisMapper - kept as plain TEXT here so
    // the entity doesn't depend on a Hibernate JSONB extension.
    @Column(name = "key_points_json", nullable = false, columnDefinition = "TEXT")
    private String keyPointsJson;

    @Column(name = "decisions_json", nullable = false, columnDefinition = "TEXT")
    private String decisionsJson;

    @Column(name = "risks_json", nullable = false, columnDefinition = "TEXT")
    private String risksJson;

    @Column(name = "opportunities_json", nullable = false, columnDefinition = "TEXT")
    private String opportunitiesJson;

    @Column(name = "follow_ups_json", nullable = false, columnDefinition = "TEXT")
    private String followUpsJson;

    @Column(name = "important_information_json", nullable = false, columnDefinition = "TEXT")
    private String importantInformationJson;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
