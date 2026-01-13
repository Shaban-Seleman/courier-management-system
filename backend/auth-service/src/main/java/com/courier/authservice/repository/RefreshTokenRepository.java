package com.courier.authservice.repository;

import com.courier.authservice.domain.RefreshToken;
import com.courier.authservice.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByTokenValue(String tokenValue);
    void deleteByUser(User user);
}
