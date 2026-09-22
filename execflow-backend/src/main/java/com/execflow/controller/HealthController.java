package com.execflow.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Simple unauthenticated health check used to verify the backend
 * is up and reachable before wiring in the rest of the modules.
 */
@RestController
public class HealthController {

    @GetMapping("/api/v1/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "UP",
                "service", "execflow-backend",
                "timestamp", Instant.now().toString()
        );
    }
}
