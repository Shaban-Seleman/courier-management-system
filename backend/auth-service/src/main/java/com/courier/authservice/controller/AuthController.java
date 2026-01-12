package com.courier.authservice.controller;

import com.courier.authservice.domain.User;
import com.courier.authservice.service.JwtService;
import com.courier.authservice.service.InMemoryUserDetailsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final InMemoryUserDetailsService userDetailsService;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, InMemoryUserDetailsService userDetailsService, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody User user) throws Exception {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.username(), user.password())
        );

        final UserDetails userDetails = userDetailsService.loadUserByUsername(user.username());
        final String jwt = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(new AuthenticationResponse(jwt));
    }
}

record AuthenticationResponse(String jwt) {
}
