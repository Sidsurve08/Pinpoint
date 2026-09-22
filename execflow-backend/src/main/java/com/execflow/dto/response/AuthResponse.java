package com.execflow.dto.response;

public record AuthResponse(
        String token,
        long expiresInMs,
        UserResponse user
) {
}
