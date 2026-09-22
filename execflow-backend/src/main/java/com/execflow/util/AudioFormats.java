package com.execflow.util;

import java.util.Map;
import java.util.Set;

public final class AudioFormats {

    public static final Set<String> ALLOWED_EXTENSIONS = Set.of("mp3", "wav", "m4a");

    private static final Map<String, String> CONTENT_TYPES = Map.of(
            "mp3", "audio/mpeg",
            "wav", "audio/wav",
            "m4a", "audio/mp4"
    );

    private AudioFormats() {
    }

    public static boolean isAllowed(String extension) {
        return extension != null && ALLOWED_EXTENSIONS.contains(extension.toLowerCase());
    }

    public static String contentTypeFor(String extension) {
        return CONTENT_TYPES.getOrDefault(
                extension == null ? "" : extension.toLowerCase(),
                "application/octet-stream"
        );
    }
}
