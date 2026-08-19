package com.yatrika.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.yatrika.entity.Booking;
import com.yatrika.enums.BookingState;

public record BookingView(
        Long bookingId,
        String bookingReference,
        Long hotelId,
        String hotelName,
        String guestName,
        String guestEmail,
        String guestPhone,
        String roomNumber,
        String roomType,
        LocalDate checkInDate,
        LocalDate checkOutDate,
        Integer numberOfGuests,
        BookingState bookingState,
        Double totalPrice,
        LocalDateTime bookingTimestamp) {

    public static BookingView from(Booking booking) {
        return new BookingView(
                booking.getBookingId(),
                booking.getBookingReference(),
                booking.getHotel().getHotelId(),
                booking.getHotel().getName(),
                booking.getUser().getName(),
                booking.getUser().getEmail(),
                booking.getUser().getPhone(),
                booking.getRoom() == null ? null : booking.getRoom().getRoomNumber(),
                booking.getRoomCategory() == null || booking.getRoomCategory().getRoomType() == null
                        ? null : booking.getRoomCategory().getRoomType().name(),
                booking.getCheckInDate(),
                booking.getCheckOutDate(),
                booking.getNumberOfGuests(),
                booking.getBookingState(),
                booking.getTotalPrice(),
                booking.getBookingTimestamp());
    }
}
