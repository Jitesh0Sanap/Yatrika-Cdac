package com.yatrika.servicesImpl;




import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.yatrika.entity.User;
import com.yatrika.entity.PasswordResetToken;
import com.yatrika.enums.Role;
import com.yatrika.repository.UserRepository;
import com.yatrika.repository.PasswordResetTokenRepository;
import com.yatrika.servives.UserService;
import com.yatrika.servives.EmailService;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

import com.yatrika.config.Loggable;

@Service
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder,
                           PasswordResetTokenRepository tokenRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
    }

    @Override
    @Loggable
    public User register(User user) {

        return createUser(user, Role.CUSTOMER);
    }

    @Override
    @Loggable
    public User registerHotelOwner(User user) {

        return createUser(user, Role.HOTEL_OWNER);
    }

    private User createUser(User user, Role role) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        user.setRole(role);
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    @Override
    @Loggable
    public User login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean matches = passwordEncoder.matches(password, user.getPassword());
        if (!matches && password.equals(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(password));
            userRepository.save(user);
            return user;
        }
        if (!matches) {
            throw new RuntimeException("Wrong password");
        }

        return user;
    }

    @Override
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    @Loggable
    public User updateUser(Long userId, User newUser) {

        User user = getUserById(userId);

        user.setName(newUser.getName());
        user.setPhone(newUser.getPhone());
        user.setTravelType(newUser.getTravelType());
        user.setBudgetPref(newUser.getBudgetPref());

        return userRepository.save(user);
    }

    @Override
    @Loggable
    public void forgotPassword(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return; // Don't expose if email exists
        }
        User user = userOpt.get();

        SecureRandom secureRandom = new SecureRandom();
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .isUsed(false)
                .build();
        tokenRepository.save(resetToken);

        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
    }

    @Override
    @Loggable
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        if (resetToken.isUsed()) {
            throw new RuntimeException("Token has already been used");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }
}
