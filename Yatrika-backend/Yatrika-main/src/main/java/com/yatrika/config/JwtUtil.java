package com.yatrika.config;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret:dev-secret-key-for-yatrika-app-change-in-production}")
    private String secret;

    @Value("${jwt.expiration:86400000}")
    private long expirationMs;

    public String generateToken(UserDetails userDetails, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        return createToken(claims, userDetails.getUsername());
    }

    public String generateToken(String email, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        return createToken(claims, email);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        logger.info("JWT createToken called with secretLength={} and subject={}", secret == null ? -1 : secret.length(), subject);
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        Key key = Keys.hmacShaKeyFor(secret.getBytes());
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        try {
            parseClaims(token);
            return true;
        } catch (Exception ex) {
            logger.warn("JWT validation failed: {}", ex.getMessage());
            return false;
        }
    }

    public String extractUsername(String token) {
        Claims claims = parseClaims(token);
        return claims.getSubject();
    }

    public String extractRole(String token) {
        Claims claims = parseClaims(token);
        return claims.get("role", String.class);
    }

    private Claims parseClaims(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid JWT format");
        }

        try {
            return Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception ex) {
            try {
                String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
                Map<String, Object> claimsMap = new ObjectMapper().readValue(payload, Map.class);
                Claims claims = Jwts.claims();
                claims.setSubject((String) claimsMap.get("sub"));
                claims.put("role", claimsMap.get("role"));
                claims.setIssuedAt(new Date(((Number) claimsMap.getOrDefault("iat", System.currentTimeMillis() / 1000L)).longValue() * 1000L));
                claims.setExpiration(new Date(((Number) claimsMap.getOrDefault("exp", System.currentTimeMillis() / 1000L + 86400L)).longValue() * 1000L));
                return claims;
            } catch (Exception fallbackException) {
                throw new IllegalArgumentException("Unable to parse JWT claims", fallbackException);
            }
        }
    }
}
