package com.yatrika;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.yatrika.entity.User;
import com.yatrika.repository.UserRepository;
import com.yatrika.repository.PasswordResetTokenRepository;
import com.yatrika.servicesImpl.UserServiceImpl;
import com.yatrika.servives.EmailService;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;
    
    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;
    
    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void registerShouldHashPasswordAndLoginShouldWork() {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        userService = new UserServiceImpl(userRepository, passwordEncoder, passwordResetTokenRepository, emailService);

        when(userRepository.existsByEmail("guest@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findByEmail("guest@example.com")).thenReturn(Optional.of(User.builder()
                .userId(1L)
                .name("Guest")
                .email("guest@example.com")
                .password(passwordEncoder.encode("secret123"))
                .build()));

        User saved = userService.register(User.builder()
                .name("Guest")
                .email("guest@example.com")
                .password("secret123")
                .build());

        assertThat(saved.getPassword()).isNotEqualTo("secret123");
        assertThat(passwordEncoder.matches("secret123", saved.getPassword())).isTrue();
        User loggedIn = userService.login("guest@example.com", "secret123");
        assertThat(loggedIn.getEmail()).isEqualTo("guest@example.com");
    }
}

