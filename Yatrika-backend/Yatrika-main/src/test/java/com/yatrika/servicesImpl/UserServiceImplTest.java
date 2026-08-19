package com.yatrika.servicesImpl;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.yatrika.entity.User;
import com.yatrika.repository.UserRepository;

class UserServiceImplTest {

    @Test
    void loginAcceptsLegacyPlaintextPasswordsAndUpgradesThem() {
        UserRepository userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        UserServiceImpl service = new UserServiceImpl(userRepository, passwordEncoder, mock(com.yatrika.repository.PasswordResetTokenRepository.class), mock(com.yatrika.servives.EmailService.class));

        User user = User.builder()
                .email("owner@yatrika.com")
                .password("owner123")
                .build();

        when(userRepository.findByEmail("owner@yatrika.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("owner123", "owner123")).thenReturn(false);
        when(passwordEncoder.encode("owner123")).thenReturn("$2a$10$encodedPassword");

        User loggedIn = service.login("owner@yatrika.com", "owner123");

        assertSame(user, loggedIn);
        verify(userRepository).save(user);
    }
}
