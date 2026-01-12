package com.courier.authservice.service;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class InMemoryUserDetailsService implements UserDetailsService {

    private final List<UserDetails> users = new ArrayList<>();
    private final PasswordEncoder passwordEncoder;

    public InMemoryUserDetailsService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
        users.add(User.withUsername("user")
                .password(passwordEncoder.encode("password"))
                .roles("USER")
                .build());
        users.add(User.withUsername("admin")
                .password(passwordEncoder.encode("password"))
                .roles("ADMIN")
                .build());
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<UserDetails> user = users.stream()
                .filter(u -> u.getUsername().equals(username))
                .findFirst();
        if (user.isEmpty()) {
            throw new UsernameNotFoundException("User not found");
        }
        return user.get();
    }
}
