package com.yatrika.dto;

import com.yatrika.enums.PaymentStatus;
import lombok.Data;

@Data
public class PaymentRequest {
    private Long bookingId;
    private Double amount;
    private String paymentMethod;
    private String transactionReference;
    private PaymentStatus paymentStatus;
}
