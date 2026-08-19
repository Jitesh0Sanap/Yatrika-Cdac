package com.yatrika.dto;

import com.yatrika.enums.Role;
import com.yatrika.enums.TravelType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    private String email;
    private String password;
}
