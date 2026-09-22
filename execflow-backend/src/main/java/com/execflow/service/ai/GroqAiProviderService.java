package com.execflow.service.ai;

import com.execflow.dto.ai.AiAnalysisResult;
import com.execflow.dto.ai.AiBriefNarrative;
import com.execflow.dto.ai.AiNotesNarrative;
import com.execflow.dto.ai.AiToolType;
import com.execflow.exception.ApiException;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GroqAiProviderService implements AiProviderService {

    private static final String ANALYSIS_SYSTEM_PROMPT = """
            You are an executive analysis assistant. Given a transcript or
            note from a business leader, extract a structured summary.

            Rules you must follow strictly:
            - Stay grounded in the source content. Never invent facts, names,
              numbers, owners, or deadlines that are not present or clearly
              implied in the text.
            - If no owner is stated for an action item, set "owner" to null.
              Do not guess a plausible-sounding name.
            - If no deadline is stated, set "deadline" to null. If one is
              stated, output it as an ISO-8601 date (YYYY-MM-DD). If only a
              relative date is given (e.g. "next Friday") and today's date
              isn't known to you, set it to null rather than guessing a date.
            - Only extract a "decision" if the text describes something that
              was explicitly decided or agreed - not something merely
              suggested, proposed, or discussed as an option.
            - "risks" and "opportunities" may include reasonable inference
              from the material, but keep them clearly tied to what's in the
              text - do not introduce unrelated speculation.
            - priority must be one of: LOW, MEDIUM, HIGH, URGENT.
            - Respond with ONLY a single JSON object, no prose before or
              after it, matching exactly this shape:

            {
              "executiveSummary": "string",
              "keyPoints": ["string", ...],
              "decisions": ["string", ...],
              "actionItems": [
                {
                  "title": "string",
                  "description": "string",
                  "owner": "string or null",
                  "deadline": "YYYY-MM-DD or null",
                  "priority": "LOW | MEDIUM | HIGH | URGENT"
                }
              ],
              "risks": ["string", ...],
              "opportunities": ["string", ...],
              "followUps": ["string", ...],
              "importantInformation": ["string", ...]
            }

            If a section has nothing relevant in the source text, return an
            empty array for it rather than omitting the key.
            """;

    private static final String BRIEF_SYSTEM_PROMPT = """
            You are an executive brief writer. You will be given the
            original source material and a structured analysis already
            extracted from it (executive summary, key points, decisions,
            risks, opportunities, action items). Your ONLY job is to write
            the narrative sections that analysis doesn't already cover.

            Rules:
            - Stay grounded in the provided source and analysis. Do not
              invent facts, figures, or names not present in them.
            - "background": 2-4 sentences of context leading up to this
              topic.
            - "currentSituation": 2-4 sentences on the present state of
              affairs relevant to this topic.
            - "recommendations": a short paragraph synthesizing what the
              opportunities and decisions imply the organization should do.
            - "nextSteps": 2-5 concrete next actions, distinct from (not
              duplicating) any action items already extracted.
            - "title": a short, specific, professional title for this brief
              (a few words) - not a generic label like "Executive Brief".
            - Respond with ONLY a JSON object matching exactly this shape:
            {
              "title": "string",
              "background": "string",
              "currentSituation": "string",
              "recommendations": "string",
              "nextSteps": ["string", ...]
            }
            """;

    private static final String NOTES_SYSTEM_PROMPT = """
            You are an executive notes writer. You will be given the
            original source material and a structured analysis already
            extracted from it (executive summary, key points, decisions,
            action items, follow-ups). Your ONLY job is to write the
            narrative sections that analysis doesn't already cover.

            Rules:
            - Stay grounded in the provided source and analysis. Do not
              invent facts, figures, or names not present in them.
            - "context": 1-3 sentences framing what this meeting/note was
              about and why it matters.
            - "nextSteps": 2-5 concrete next actions, distinct from (not
              duplicating) any action items or follow-ups already extracted.
            - "title": a short, specific, professional title for these notes
              (a few words) - not a generic label like "Meeting Notes".
            - Respond with ONLY a JSON object matching exactly this shape:
            {
              "title": "string",
              "context": "string",
              "nextSteps": ["string", ...]
            }
            """;

    private static final String SUMMARIZE_PROMPT = """
            Summarize the following text concisely, preserving the key facts,
            figures, and names exactly as given. Do not invent information
            that isn't present. Return ONLY the summary - no preamble, no
            "Here is a summary:", no closing remarks.
            """;

    private static final String IMPROVE_PROMPT = """
            Rewrite the following text to be clearer and better organized,
            fixing grammar and awkward phrasing, while preserving its exact
            meaning and every fact stated in it. Do not add new claims.
            Return ONLY the rewritten text.
            """;

    private static final String EXEC_READY_PROMPT = """
            Rewrite the following text in a concise, professional tone
            suitable for a senior executive audience - direct, confident,
            no filler. Preserve every fact and figure exactly; do not add
            new claims or soften/exaggerate anything stated. Return ONLY
            the rewritten text.
            """;

    private static final String EXTRACT_ACTIONS_PROMPT = """
            Extract clear, actionable tasks from the following text. Only
            include things that are genuinely actionable - not general
            statements or background information. Return ONLY a bulleted
            list, one action per line, each starting with "- ". If there are
            no clear actions, return exactly: "No action items found."
            """;

    private final WebClient groqWebClient;
    private final ObjectMapper objectMapper;
    private final String model;

    public GroqAiProviderService(
            WebClient groqWebClient,
            ObjectMapper objectMapper,
            @Value("${execflow.ai.groq.model}") String model
    ) {
        this.groqWebClient = groqWebClient;
        this.objectMapper = objectMapper;
        this.model = model;
    }

    @Override
    public AiAnalysisResult analyze(String sourceText) {
        return callForJson(ANALYSIS_SYSTEM_PROMPT, sourceText, AiAnalysisResult.class);
    }

    @Override
    public AiBriefNarrative generateBriefNarrative(String sourceText, String analysisContext) {
        String userContent = buildNarrativeUserContent(sourceText, analysisContext);
        return callForJson(BRIEF_SYSTEM_PROMPT, userContent, AiBriefNarrative.class);
    }

    @Override
    public AiNotesNarrative generateNotesNarrative(String sourceText, String analysisContext) {
        String userContent = buildNarrativeUserContent(sourceText, analysisContext);
        return callForJson(NOTES_SYSTEM_PROMPT, userContent, AiNotesNarrative.class);
    }

    @Override
    public String runTool(String text, AiToolType tool, String customPrompt) {
        String systemPrompt = switch (tool) {
            case SUMMARIZE -> SUMMARIZE_PROMPT;
            case IMPROVE -> IMPROVE_PROMPT;
            case EXEC_READY -> EXEC_READY_PROMPT;
            case EXTRACT_ACTIONS -> EXTRACT_ACTIONS_PROMPT;
            case CUSTOM -> buildCustomPrompt(customPrompt);
            case ANALYZE -> throw new ApiException(HttpStatus.BAD_REQUEST,
                    "ANALYZE returns structured data - use the Analysis endpoint instead of AI Tools for it");
        };

        return callForText(systemPrompt, text);
    }

    private String buildCustomPrompt(String customPrompt) {
        if (customPrompt == null || customPrompt.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "customPrompt is required when tool=CUSTOM");
        }
        return customPrompt.trim()
                + "\n\nStay grounded in the text provided - do not invent facts not present in it. "
                + "Return ONLY the result, no preamble.";
    }

    private String buildNarrativeUserContent(String sourceText, String analysisContext) {
        return "SOURCE MATERIAL:\n" + sourceText
                + "\n\n---\n\nEXTRACTED ANALYSIS:\n" + analysisContext;
    }

    private <T> T callForJson(String systemPrompt, String userContent, Class<T> targetType) {
        String content = callGroq(systemPrompt, userContent, true);
        try {
            return objectMapper.readValue(content, targetType);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY,
                    "The AI provider returned a response that couldn't be parsed. Try again.");
        }
    }

    private String callForText(String systemPrompt, String userContent) {
        return callGroq(systemPrompt, userContent, false);
    }

    private String callGroq(String systemPrompt, String userContent, boolean jsonMode) {
        Map<String, Object> requestBody = new HashMap<>(Map.of(
                "model", model,
                "temperature", 0.2,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userContent)
                )
        ));
        if (jsonMode) {
            requestBody.put("response_format", Map.of("type", "json_object"));
        }

        try {
            GroqChatResponse response = groqWebClient.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(GroqChatResponse.class)
                    .block();

            return extractContent(response);

        } catch (WebClientResponseException e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY,
                    "AI provider error (" + e.getStatusCode() + "): " + e.getResponseBodyAsString());
        } catch (WebClientRequestException e) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Could not reach the AI provider. Check your network connection.");
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY,
                    "The AI provider returned an unexpected response. Try again.");
        }
    }

    private String extractContent(GroqChatResponse response) {
        if (response == null || response.choices() == null || response.choices().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "AI provider returned no result");
        }
        String content = response.choices().get(0).message().content();
        if (content == null || content.isBlank()) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "AI provider returned an empty result");
        }
        return content;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record GroqChatResponse(List<Choice> choices) {
        @JsonIgnoreProperties(ignoreUnknown = true)
        private record Choice(Message message) {
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        private record Message(String content) {
        }
    }
}
