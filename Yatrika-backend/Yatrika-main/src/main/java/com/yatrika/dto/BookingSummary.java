package com.yatrika.dto;

import java.time.LocalDateTime;
import java.util.List;

public class BookingSummary {
    public Long bookingId;
    public Long hotelId;
    public String hotelName;
    public Long roomCategoryId;
    public String roomType;
    public Double pricePerNight;
    public Long numberOfNights;
    public Integer numberOfGuests;
    public Double roomCost;
    public List<AddOnLine> addOnLines;
    public Double addOnTotal;
    public Double taxes;
    public Double totalPrice;
    public String bookingState;
    public LocalDateTime bookingTimestamp;

    public BookingSummary() {}

    public static class AddOnLine {
        public Long addOnId;
        public String name;
        public Integer quantity;
        public Double unitPrice;
        public Double totalPrice;

        public AddOnLine() {}

        public AddOnLine(Long addOnId, String name, Integer quantity, Double unitPrice, Double totalPrice) {
            this.addOnId = addOnId;
            this.name = name;
            this.quantity = quantity;
            this.unitPrice = unitPrice;
            this.totalPrice = totalPrice;
        }
    }
}
