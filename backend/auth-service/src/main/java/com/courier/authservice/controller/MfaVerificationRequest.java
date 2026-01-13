package com.courier.authservice.controller;

public record MfaVerificationRequest(String email, String code) {
}
