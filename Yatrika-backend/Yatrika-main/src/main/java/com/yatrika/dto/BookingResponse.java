package com.yatrika.dto;

public class BookingResponse {
    public Long bookingId;
    public String bookingReference;
    public String bookingState;
    public Double totalPrice;

    public BookingResponse() {}

    public BookingResponse(Long bookingId, String bookingReference, String bookingState, Double totalPrice) {
        this.bookingId = bookingId;
        this.bookingReference = bookingReference;
        this.bookingState = bookingState;
        this.totalPrice = totalPrice;
    }
}
