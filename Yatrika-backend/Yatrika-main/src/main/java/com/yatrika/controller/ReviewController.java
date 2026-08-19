package com.yatrika.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yatrika.dto.ReviewDTO;
import com.yatrika.entity.User;
import com.yatrika.repository.UserRepository;
import com.yatrika.servives.ReviewService;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    public ReviewController(ReviewService reviewService, UserRepository userRepository) {
        this.reviewService = reviewService;
        this.userRepository = userRepository;
    }

    @PostMapping("/booking/{bookingId}")
    public ResponseEntity<?> createReview(@PathVariable Long bookingId, @RequestBody ReviewDTO reviewDTO) {
        User currentCustomer = currentCustomer();
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.createReview(bookingId, reviewDTO, currentCustomer));
    }

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsForHotel(@PathVariable Long hotelId) {
        return ResponseEntity.ok(reviewService.getReviewsForHotel(hotelId));
    }

    @GetMapping("/my-reviews")
    public ResponseEntity<List<ReviewDTO>> getMyReviews() {
        return ResponseEntity.ok(reviewService.getMyReviews(currentCustomer()));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewDTO> updateReview(@PathVariable Long reviewId, @RequestBody ReviewDTO reviewDTO) {
        return ResponseEntity.ok(reviewService.updateReview(reviewId, reviewDTO, currentCustomer()));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId, currentCustomer());
        return ResponseEntity.noContent().build();
    }

    private User currentCustomer() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required.");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found."));
    }
}
