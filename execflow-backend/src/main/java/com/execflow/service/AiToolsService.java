package com.execflow.service;

import com.execflow.dto.ai.AiAnalysisResult;
import com.execflow.dto.ai.AiToolType;
import com.execflow.dto.request.RunAiToolRequest;
import com.execflow.dto.response.RunAiToolResponse;
import com.execflow.exception.ApiException;
import com.execflow.service.ai.AiProviderService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiToolsService {

    private final AiProviderService aiProviderService;

    public AiToolsService(AiProviderService aiProviderService) {
        this.aiProviderService = aiProviderService;
    }

    public RunAiToolResponse run(RunAiToolRequest request) {
        if (request.text() == null || request.text().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Text is required");
        }

        String output = request.tool() == AiToolType.ANALYZE
                ? runAnalyzeAsText(request.text())
                : aiProviderService.runTool(request.text(), request.tool(), request.customPrompt());

        int wordCount = output.isBlank() ? 0 : output.trim().split("\\s+").length;
        return new RunAiToolResponse(output, wordCount);
    }

    /**
     * The ANALYZE tool button reuses the same structured analyze() call as
     * the Analysis module, then formats it into readable text for the
     * workbench's plain-text output panel - keeping one analysis code path
     * rather than a second, simplified one just for this view.
     */
    private String runAnalyzeAsText(String text) {
        AiAnalysisResult result = aiProviderService.analyze(text);
        StringBuilder sb = new StringBuilder();

        sb.append("Executive Summary\n").append(result.executiveSummary()).append("\n\n");
        appendSection(sb, "Key Points", result.keyPoints());
        appendSection(sb, "Decisions", result.decisions());

        if (result.actionItems() != null && !result.actionItems().isEmpty()) {
            sb.append("Action Items\n");
            result.actionItems().forEach(item -> {
                sb.append("- ").append(item.title());
                if (item.owner() != null) sb.append(" (Owner: ").append(item.owner()).append(")");
                if (item.deadline() != null) sb.append(" (Due: ").append(item.deadline()).append(")");
                if (item.priority() != null) sb.append(" [").append(item.priority()).append("]");
                sb.append("\n");
            });
            sb.append("\n");
        }

        appendSection(sb, "Risks", result.risks());
        appendSection(sb, "Opportunities", result.opportunities());
        appendSection(sb, "Follow-ups", result.followUps());
        appendSection(sb, "Important Information", result.importantInformation());

        return sb.toString().trim();
    }

    private void appendSection(StringBuilder sb, String label, List<String> items) {
        if (items == null || items.isEmpty()) return;
        sb.append(label).append("\n");
        items.forEach(i -> sb.append("- ").append(i).append("\n"));
        sb.append("\n");
    }
}
