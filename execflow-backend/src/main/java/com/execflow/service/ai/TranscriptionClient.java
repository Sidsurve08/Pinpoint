package com.execflow.service.ai;

import org.springframework.core.io.Resource;

public interface TranscriptionClient {

    /**
     * Sends the given audio to the speech-to-text provider and returns the
     * resulting plain-text transcript.
     */
    String transcribe(Resource audioResource, String fileName, String contentType);
}
