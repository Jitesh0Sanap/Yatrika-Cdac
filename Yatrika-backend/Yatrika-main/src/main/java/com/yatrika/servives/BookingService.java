package com.yatrika.servives;

import java.time.LocalDate;
import java.util.List;

import com.yatrika.dto.AddOnRequest;
import com.yatrika.entity.Booking;
import com.yatrika.entity.Room;
import com.yatrika.entity.RoomCategory;
import com.yatrika.entity.User;
import com.yatrika.enums.BookingState;

public interface BookingService {

    Booking createBooking(User user, Long hotelId, Long roomCategoryId, LocalDate checkInDate,
                          LocalDate checkOutDate, Integer numberOfGuests, List<AddOnRequest> addOns);

    com.yatrika.dto.BookingSummary previewBooking(com.yatrika.dto.BookingRequest request);

    com.yatrika.dto.BookingResponse createBookingFromRequest(com.yatrika.dto.BookingRequest request);

    List<Booking> findConflictingBookings(Room room, LocalDate checkInDate, LocalDate checkOutDate);

    Room allocateAvailableRoom(RoomCategory roomCategory, LocalDate checkInDate, LocalDate checkOutDate);

    Booking cancelBooking(Long bookingId);

    Booking getBookingById(Long bookingId);

    List<Booking> getBookingsByStateAndOwner(Long ownerId, BookingState bookingState);

    List<Booking> getBookingsByOwner(Long ownerId);
}
