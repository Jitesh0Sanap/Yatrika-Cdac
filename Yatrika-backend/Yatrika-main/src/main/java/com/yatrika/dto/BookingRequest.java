package com.yatrika.dto;

import java.time.LocalDate;
import java.util.List;

public class BookingRequest {
    public Long userId;
    public Long hotelId;
    public Long roomCategoryId;
    public LocalDate checkInDate;
    public LocalDate checkOutDate;
    public Integer numberOfGuests;
    public List<AddOnRequest> addOns;
    public String specialRequests;
    public Double discount;

    public BookingRequest() {}
}
