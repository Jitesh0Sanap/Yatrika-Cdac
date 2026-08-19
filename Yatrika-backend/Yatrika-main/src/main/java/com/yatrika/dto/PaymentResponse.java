package com.yatrika.dto;

import java.time.LocalDateTime;

import com.yatrika.enums.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaymentResponse {
    private Long paymentId;
    private Long bookingId;
    private Double amount;
    private String paymentMethod;
    private String transactionReference;
    private PaymentStatus paymentStatus;
    private String bookingStatus;
    private LocalDateTime paymentTime;
}
