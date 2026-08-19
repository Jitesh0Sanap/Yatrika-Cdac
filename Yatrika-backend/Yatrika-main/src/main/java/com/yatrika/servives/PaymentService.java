package com.yatrika.servives;

import com.yatrika.dto.PaymentRequest;
import com.yatrika.dto.PaymentResponse;

public interface PaymentService {
    PaymentResponse createPayment(Long bookingId, PaymentRequest request);
    com.yatrika.dto.RazorpayOrderResponse createOrder(Long bookingId);
    PaymentResponse verifyPayment(Long bookingId, com.yatrika.dto.PaymentVerificationRequest request);
    void handleWebhook(String payload, String signature);
}
