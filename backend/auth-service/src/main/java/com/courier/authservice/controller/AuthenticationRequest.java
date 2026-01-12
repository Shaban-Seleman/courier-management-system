package com.courier.authservice.controller;

public record AuthenticationRequest(String username, String password) {
}
