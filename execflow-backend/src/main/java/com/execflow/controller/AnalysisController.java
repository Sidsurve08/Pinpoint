package com.execflow.controller;

import com.execflow.dto.response.AnalysisResponse;
import com.execflow.security.UserPrincipal;
import com.execflow.service.AnalysisService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inputs/{inputId}")
public class AnalysisController {

    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping("/analyze")
    public AnalysisResponse analyze(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID inputId
    ) {
        return analysisService.analyze(principal.getId(), inputId);
    }

    @GetMapping("/analysis")
    public AnalysisResponse getAnalysis(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID inputId
    ) {
        return analysisService.getForUser(principal.getId(), inputId);
    }
}
