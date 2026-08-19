package com.yatrika.dto;

import com.yatrika.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
public class AuthResponse {

    private Long userId;
    private String name;
    private String email;
    private Role role;
    private String token;

    public AuthResponse(Long userId, String name, String email, Role role, String token) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.token = token;
    }
}
