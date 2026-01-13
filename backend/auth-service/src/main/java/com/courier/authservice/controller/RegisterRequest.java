package com.courier.authservice.controller;

import java.util.UUID;

public record RegisterRequest(
        String username,
        String email,
        String password,
        String firstName,
        String lastName,
        UUID roleId
) {
}
