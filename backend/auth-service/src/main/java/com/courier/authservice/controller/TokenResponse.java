package com.courier.authservice.controller;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record TokenResponse(
    String accessToken, 
    String refreshToken, 
    String mfaStatus,
    String message
) {
    public static TokenResponse success(String accessToken, String refreshToken) {
        return new TokenResponse(accessToken, refreshToken, null, null);
    }

    public static TokenResponse mfaRequired(String message) {
        return new TokenResponse(null, null, "MFA_REQUIRED", message);
    }
}
