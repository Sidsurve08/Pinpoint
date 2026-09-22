package com.execflow.service.ai;

import com.execflow.dto.ai.AiAnalysisResult;
import com.execflow.dto.ai.AiBriefNarrative;
import com.execflow.dto.ai.AiNotesNarrative;
import com.execflow.dto.ai.AiToolType;

public interface AiProviderService {

    /**
     * Sends the given source text (a transcript or raw text input) to the
     * LLM and returns the structured extraction result.
     */
    AiAnalysisResult analyze(String sourceText);

    /**
     * Generates only the narrative sections an Executive Brief needs beyond
     * what analyze() already extracted (background, current situation,
     * recommendations, next steps) - grounded in both the original source
     * and the already-extracted analysis, to avoid re-deriving facts.
     */
    AiBriefNarrative generateBriefNarrative(String sourceText, String analysisContext);

    /** Same idea as generateBriefNarrative, for Meeting/Executive Notes. */
    AiNotesNarrative generateNotesNarrative(String sourceText, String analysisContext);

    /**
     * Runs a single free-text transformation (summarize, improve, etc.) on
     * arbitrary pasted text, for the AI Tools workbench. Not for
     * AiToolType.ANALYZE - callers should use analyze() for that, since it
     * needs structured output rather than free text.
     */
    String runTool(String text, AiToolType tool, String customPrompt);
}
