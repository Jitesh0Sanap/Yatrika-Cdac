package com.yatrika.controller;




import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yatrika.entity.User;
import com.yatrika.servives.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Register user
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.register(user);
    }

    // Hotel-owner registration
    @PostMapping("/register-owner")
    public User registerHotelOwner(@RequestBody User user) {
        return userService.registerHotelOwner(user);
    }

    // Login user
    @PostMapping("/login")
    public User login(@RequestBody User user) {
        return userService.login(user.getEmail(), user.getPassword());
    }

    // View user profile
    @GetMapping("/{userId}")
    public User getUserById(@PathVariable Long userId) {
        return userService.getUserById(userId);
    }

    // Update user profile
    @PutMapping("/{userId}")
    public User updateUser(@PathVariable Long userId,
                           @RequestBody User user) {
        return userService.updateUser(userId, user);
    }
}
