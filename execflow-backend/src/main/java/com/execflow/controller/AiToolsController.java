package com.execflow.controller;

import com.execflow.dto.request.RunAiToolRequest;
import com.execflow.dto.response.RunAiToolResponse;
import com.execflow.service.AiToolsService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai-tools")
public class AiToolsController {

    private final AiToolsService aiToolsService;

    public AiToolsController(AiToolsService aiToolsService) {
        this.aiToolsService = aiToolsService;
    }

    @PostMapping("/process")
    public RunAiToolResponse process(@Valid @RequestBody RunAiToolRequest request) {
        return aiToolsService.run(request);
    }
}
