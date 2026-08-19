package com.yatrika.servives;

import java.util.List;

import com.yatrika.dto.ReviewDTO;
import com.yatrika.entity.User;

public interface ReviewService {
    ReviewDTO createReview(Long bookingId, ReviewDTO reviewDTO, User currentCustomer);
    List<ReviewDTO> getReviewsForHotel(Long hotelId);
    List<ReviewDTO> getMyReviews(User currentCustomer);
    ReviewDTO updateReview(Long reviewId, ReviewDTO reviewDTO, User currentCustomer);
    void deleteReview(Long reviewId, User currentCustomer);
}
