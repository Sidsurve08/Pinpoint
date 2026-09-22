package com.execflow.service.ai;

import com.execflow.exception.ApiException;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
public class GroqTranscriptionClient implements TranscriptionClient {

    private final WebClient groqWebClient;
    private final String model;

    public GroqTranscriptionClient(
            WebClient groqWebClient,
            @Value("${execflow.ai.groq.transcription-model}") String model
    ) {
        this.groqWebClient = groqWebClient;
        this.model = model;
    }

    @Override
    public String transcribe(Resource audioResource, String fileName, String contentType) {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("model", model);
        builder.part("file", audioResource)
                .filename(fileName)
                .contentType(MediaType.parseMediaType(contentType));

        try {
            GroqTranscriptionResponse response = groqWebClient.post()
                    .uri("/audio/transcriptions")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(GroqTranscriptionResponse.class)
                    .block();

            if (response == null || response.text() == null || response.text().isBlank()) {
                throw new ApiException(HttpStatus.BAD_GATEWAY,
                        "The transcription service returned an empty result");
            }

            return response.text().trim();

        } catch (WebClientResponseException e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY,
                    "Transcription service error (" + e.getStatusCode() + "). "
                            + "Check that the audio file is valid and the Groq transcription config is correct.");
        } catch (WebClientRequestException e) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Could not reach the transcription service. Check your network connection and Groq configuration.");
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record GroqTranscriptionResponse(String text) {
    }
}
