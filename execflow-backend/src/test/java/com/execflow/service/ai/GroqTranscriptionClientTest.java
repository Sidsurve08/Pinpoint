package com.execflow.service.ai;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GroqTranscriptionClientTest {

    @Test
    void transcribeUsesGroqMultipartApiAndReturnsText() throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        AtomicReference<String> requestMethod = new AtomicReference<>();
        AtomicReference<String> requestContentType = new AtomicReference<>();

        server.createContext("/audio/transcriptions", exchange -> {
            requestMethod.set(exchange.getRequestMethod());
            requestContentType.set(exchange.getRequestHeaders().getFirst("Content-Type"));

            String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            assertTrue(body.contains("name=\"model\""));
            assertTrue(body.contains("whisper-large-v3-turbo"));
            assertTrue(body.contains("name=\"file\""));

            String json = "{\"text\":\"hello from groq\"}";
            byte[] responseBytes = json.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, responseBytes.length);
            exchange.getResponseBody().write(responseBytes);
            exchange.close();
        });
        server.start();

        try {
            WebClient webClient = WebClient.builder()
                    .baseUrl("http://localhost:" + server.getAddress().getPort())
                    .build();

            GroqTranscriptionClient client = new GroqTranscriptionClient(webClient, "whisper-large-v3-turbo");
            String transcript = client.transcribe(
                    new ByteArrayResource("audio-bytes".getBytes(StandardCharsets.UTF_8)),
                    "sample.wav",
                    "audio/wav"
            );

            assertEquals("hello from groq", transcript);
            assertEquals("POST", requestMethod.get());
            assertTrue(requestContentType.get().startsWith("multipart/form-data;"));
        } finally {
            server.stop(0);
        }
    }
}
