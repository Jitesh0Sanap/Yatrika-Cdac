package com.yatrika.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yatrika.entity.Booking;
import com.yatrika.entity.Hotel;
import com.yatrika.entity.Review;
import com.yatrika.entity.User;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByHotelOrderByCreatedAtDesc(Hotel hotel);
    List<Review> findByCustomerOrderByCreatedAtDesc(User customer);
    Optional<Review> findByBooking(Booking booking);
}
