package com.yatrika.servicesImpl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.yatrika.dto.ReviewDTO;
import com.yatrika.entity.Booking;
import com.yatrika.entity.Hotel;
import com.yatrika.entity.Review;
import com.yatrika.entity.User;
import com.yatrika.enums.BookingState;
import com.yatrika.enums.PaymentStatus;
import com.yatrika.repository.BookingRepository;
import com.yatrika.repository.HotelRepository;
import com.yatrika.repository.PaymentRepository;
import com.yatrika.repository.ReviewRepository;
import com.yatrika.repository.UserRepository;
import com.yatrika.servives.ReviewService;

import com.yatrika.config.Loggable;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository, BookingRepository bookingRepository,
                             HotelRepository hotelRepository, UserRepository userRepository,
                             PaymentRepository paymentRepository) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.hotelRepository = hotelRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
    }

    @Override
    @Transactional
    @Loggable
    public ReviewDTO createReview(Long bookingId, ReviewDTO reviewDTO, User currentCustomer) {
        if (reviewDTO == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Review payload is required.");
        }
        if (currentCustomer == null || currentCustomer.getUserId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required.");
        }

        User persistedCustomer = userRepository.findById(currentCustomer.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found."));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found."));

        if (!Objects.equals(booking.getUser().getUserId(), persistedCustomer.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only review your own booking.");
        }

        if (reviewRepository.findByBooking(booking).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already reviewed this booking.");
        }

        boolean hasSuccessfulPayment = paymentRepository.findByBookingBookingId(booking.getBookingId())
                .stream()
                .anyMatch(payment -> payment.getPaymentStatus() == PaymentStatus.SUCCESS);
        if (!hasSuccessfulPayment) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment must be successful before you can review.");
        }

        if (booking.getBookingState() != BookingState.CHECKED_OUT && booking.getBookingState() != BookingState.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only checked-out or completed bookings can be reviewed.");
        }

        if (reviewDTO.getRating() == null || reviewDTO.getRating() < 1 || reviewDTO.getRating() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5.");
        }
        if (reviewDTO.getTitle() == null || reviewDTO.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required.");
        }
        if (reviewDTO.getComment() == null || reviewDTO.getComment().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment is required.");
        }

        Hotel hotel = booking.getHotel();
        Review review = Review.builder()
                .booking(booking)
                .hotel(hotel)
                .customer(persistedCustomer)
                .rating(reviewDTO.getRating())
                .title(reviewDTO.getTitle().trim())
                .comment(reviewDTO.getComment().trim())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Review saved = reviewRepository.save(review);
        recalculateHotelRating(hotel);
        return toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewDTO> getReviewsForHotel(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel not found."));
        return reviewRepository.findByHotelOrderByCreatedAtDesc(hotel).stream().map(this::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewDTO> getMyReviews(User currentCustomer) {
        if (currentCustomer == null || currentCustomer.getUserId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required.");
        }
        User persistedCustomer = userRepository.findById(currentCustomer.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found."));
        return reviewRepository.findByCustomerOrderByCreatedAtDesc(persistedCustomer).stream().map(this::toDTO).toList();
    }

    @Override
    @Transactional
    @Loggable
    public ReviewDTO updateReview(Long reviewId, ReviewDTO reviewDTO, User currentCustomer) {
        if (currentCustomer == null || currentCustomer.getUserId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required.");
        }
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found."));
        if (!Objects.equals(review.getCustomer().getUserId(), currentCustomer.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own review.");
        }
        if (reviewDTO.getRating() != null) {
            if (reviewDTO.getRating() < 1 || reviewDTO.getRating() > 5) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5.");
            }
            review.setRating(reviewDTO.getRating());
        }
        if (reviewDTO.getTitle() != null) {
            review.setTitle(reviewDTO.getTitle().trim());
        }
        if (reviewDTO.getComment() != null) {
            review.setComment(reviewDTO.getComment().trim());
        }
        review.setUpdatedAt(LocalDateTime.now());
        Review saved = reviewRepository.save(review);
        recalculateHotelRating(saved.getHotel());
        return toDTO(saved);
    }

    @Override
    @Transactional
    @Loggable
    public void deleteReview(Long reviewId, User currentCustomer) {
        if (currentCustomer == null || currentCustomer.getUserId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required.");
        }
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found."));
        if (!Objects.equals(review.getCustomer().getUserId(), currentCustomer.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own review.");
        }
        Hotel hotel = review.getHotel();
        reviewRepository.delete(review);
        recalculateHotelRating(hotel);
    }

    private void recalculateHotelRating(Hotel hotel) {
        List<Review> reviews = reviewRepository.findByHotelOrderByCreatedAtDesc(hotel);
        double average = reviews.isEmpty() ? 0.0 : reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        hotel.setAvgRating(average);
        hotel.setReviewCount(reviews.size());
        hotelRepository.save(hotel);
    }

    private ReviewDTO toDTO(Review review) {
        return ReviewDTO.builder()
                .reviewId(review.getReviewId())
                .bookingId(review.getBooking().getBookingId())
                .hotelId(review.getHotel().getHotelId())
                .customerId(review.getCustomer().getUserId())
                .customerName(review.getCustomer().getName())
                .rating(review.getRating())
                .title(review.getTitle())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
