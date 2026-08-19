package com.yatrika.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yatrika.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByBookingBookingId(Long bookingId);
    java.util.Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
}
