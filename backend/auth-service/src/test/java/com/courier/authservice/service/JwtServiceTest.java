package com.courier.authservice.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Key;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private final String SECRET_KEY = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"; // Must be valid Base64
    private final long EXPIRATION = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", SECRET_KEY);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", EXPIRATION);
    }

    @Test
    void extractUsername_ShouldReturnCorrectUsername() {
        UserDetails user = new User("testuser", "password", new ArrayList<>());
        String token = jwtService.generateToken(user);

        String username = jwtService.extractUsername(token);

        assertEquals("testuser", username);
    }

    @Test
    void validateToken_ShouldReturnTrue_WhenTokenIsValid() {
        UserDetails user = new User("testuser", "password", new ArrayList<>());
        String token = jwtService.generateToken(user);

        boolean isValid = jwtService.validateToken(token, user);

        assertTrue(isValid);
    }

    @Test
    void validateToken_ShouldReturnFalse_WhenUsernameDoesNotMatch() {
        UserDetails user = new User("testuser", "password", new ArrayList<>());
        String token = jwtService.generateToken(user);

        UserDetails otherUser = new User("otheruser", "password", new ArrayList<>());
        boolean isValid = jwtService.validateToken(token, otherUser);

        assertFalse(isValid);
    }

    @Test
    void extractClaim_ShouldReturnCorrectClaim() {
        UserDetails user = new User("testuser", "password", new ArrayList<>());
        HashMap<String, Object> claims = new HashMap<>();
        claims.put("role", "ADMIN");
        String token = jwtService.generateToken(claims, user);

        String role = jwtService.extractClaim(token, c -> c.get("role", String.class));

        assertEquals("ADMIN", role);
    }
}
