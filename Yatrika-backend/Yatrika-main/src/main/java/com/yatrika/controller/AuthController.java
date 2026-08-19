package com.yatrika.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.yatrika.config.JwtUtil;
import com.yatrika.dto.AuthResponse;
import com.yatrika.dto.LoginRequest;
import com.yatrika.dto.ForgotPasswordRequest;
import com.yatrika.dto.ResetPasswordRequest;
import com.yatrika.entity.User;
import com.yatrika.servives.UserService;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            User user = userService.login(loginRequest.getEmail(), loginRequest.getPassword());
            return ResponseEntity.ok(toAuthResponse(user));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User registeredUser = userService.register(user);
            return ResponseEntity.ok(toAuthResponse(registeredUser));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/register-owner")
    public ResponseEntity<?> registerOwner(@RequestBody User user) {
        try {
            User registeredUser = userService.registerHotelOwner(user);
            return ResponseEntity.ok(toAuthResponse(registeredUser));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private AuthResponse toAuthResponse(User user) {
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(user.getUserId(), user.getName(), user.getEmail(), user.getRole(), token);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            userService.forgotPassword(request.getEmail());
            return ResponseEntity.ok(java.util.Map.of("message", "If that email is registered, a password reset link has been sent."));
        } catch (Exception e) {
            logger.error("Error in forgotPassword: ", e);
            return ResponseEntity.status(500).body(java.util.Map.of("error", "An internal error occurred. Please try again later."));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            userService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(java.util.Map.of("message", "Password successfully reset."));
        } catch (RuntimeException e) {
            logger.error("Validation error in resetPassword: {}", e.getMessage());
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error in resetPassword: ", e);
            return ResponseEntity.status(500).body(java.util.Map.of("error", "An internal error occurred."));
        }
    }
}
