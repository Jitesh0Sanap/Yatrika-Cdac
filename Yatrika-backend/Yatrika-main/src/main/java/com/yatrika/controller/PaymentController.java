package com.yatrika.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yatrika.dto.PaymentRequest;
import com.yatrika.dto.PaymentVerificationRequest;
import com.yatrika.servives.PaymentService;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/{bookingId}")
    public ResponseEntity<?> createPayment(@PathVariable Long bookingId, @RequestBody PaymentRequest request) {
        request.setBookingId(bookingId);
        return ResponseEntity.ok(paymentService.createPayment(bookingId, request));
    }

    @PostMapping("/{bookingId}/order")
    public ResponseEntity<?> createOrder(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.createOrder(bookingId));
    }

    @PostMapping("/{bookingId}/verify")
    public ResponseEntity<?> verifyPayment(@PathVariable Long bookingId, @RequestBody PaymentVerificationRequest request) {
        return ResponseEntity.ok(paymentService.verifyPayment(bookingId, request));
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(@RequestBody String payload, @RequestHeader("X-Razorpay-Signature") String signature) {
        paymentService.handleWebhook(payload, signature);
        return ResponseEntity.ok().build();
    }
}
