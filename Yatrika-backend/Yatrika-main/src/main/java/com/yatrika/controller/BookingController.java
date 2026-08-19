package com.yatrika.controller;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yatrika.entity.Booking;
import com.yatrika.dto.BookingRequest;
import com.yatrika.dto.BookingSummary;
import com.yatrika.dto.BookingResponse;
import com.yatrika.dto.BookingView;
import com.yatrika.entity.User;
import com.yatrika.dto.AddOnRequest;
import com.yatrika.enums.BookingState;
import com.yatrika.repository.BookingRepository;
import com.yatrika.repository.PaymentRepository;
import com.yatrika.servives.BookingService;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    public BookingController(BookingService bookingService, BookingRepository bookingRepository ,PaymentRepository paymentRepository) {
        this.bookingService = bookingService;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
    }

    @PostMapping("/summary")
    public ResponseEntity<?> previewBooking(@RequestBody BookingRequest request) {
        try {
            BookingSummary summary = bookingService.previewBooking(request);
            return ResponseEntity.ok(summary);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
        try {
            BookingResponse resp = bookingService.createBookingFromRequest(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(resp);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    private com.yatrika.dto.BookingSummary buildSummaryFromBooking(Booking booking) {
        long nights = java.time.temporal.ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
        double roomCost = booking.getRoomCategory().getPricePerNight() * nights;
        java.util.List<com.yatrika.dto.BookingSummary.AddOnLine> addOnLines = new java.util.ArrayList<>();
        double addOnTotal = 0.0;
        if (booking.getBookingAddOns() != null) {
            for (com.yatrika.entity.BookingAddOn bao : booking.getBookingAddOns()) {
                addOnLines.add(new com.yatrika.dto.BookingSummary.AddOnLine(
                        bao.getAddOn().getAddOnId(),
                        bao.getAddOn().getName(),
                        bao.getQuantity(),
                        bao.getUnitPrice(),
                        bao.getTotalPrice()
                ));
                addOnTotal += bao.getTotalPrice();
            }
        }

        com.yatrika.dto.BookingSummary summary = new com.yatrika.dto.BookingSummary();
        summary.bookingId = booking.getBookingId();
        summary.hotelId = booking.getHotel().getHotelId();
        summary.hotelName = booking.getHotel().getName();
        summary.roomCategoryId = booking.getRoomCategory().getRoomCategoryId();
        summary.roomType = booking.getRoomCategory().getRoomType().name();
        summary.pricePerNight = booking.getRoomCategory().getPricePerNight();
        summary.numberOfNights = nights;
        summary.numberOfGuests = booking.getNumberOfGuests();
        summary.roomCost = roomCost;
        summary.addOnLines = addOnLines;
        summary.addOnTotal = addOnTotal;
        summary.taxes = null;
        summary.totalPrice = booking.getTotalPrice();
        summary.bookingState = booking.getBookingState().name();
        summary.bookingTimestamp = booking.getBookingTimestamp();
        return summary;
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getBookingDetails(@PathVariable Long bookingId) {
        try {
            Booking booking = bookingService.getBookingById(bookingId);
            long nights = java.time.temporal.ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
            double roomCost = booking.getRoomCategory().getPricePerNight() * nights;

            java.util.List<com.yatrika.dto.BookingSummary.AddOnLine> addOnLines = new java.util.ArrayList<>();
            double addOnTotal = 0.0;
            if (booking.getBookingAddOns() != null) {
                for (com.yatrika.entity.BookingAddOn bao : booking.getBookingAddOns()) {
                    addOnLines.add(new com.yatrika.dto.BookingSummary.AddOnLine(
                            bao.getAddOn().getAddOnId(),
                            bao.getAddOn().getName(),
                            bao.getQuantity(),
                            bao.getUnitPrice(),
                            bao.getTotalPrice()
                    ));
                    addOnTotal += bao.getTotalPrice();
                }
            }

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("bookingId", booking.getBookingId());
            payload.put("bookingReference", booking.getBookingReference());
            payload.put("hotelId", booking.getHotel().getHotelId());
            payload.put("hotelName", booking.getHotel().getName());
            payload.put("hotelLocation", booking.getHotel().getLocation());
            payload.put("roomCategory", booking.getRoomCategory().getRoomType());
            payload.put("roomCategoryId", booking.getRoomCategory().getRoomCategoryId());
            payload.put("roomType", booking.getRoomCategory().getRoomType() == null ? null : booking.getRoomCategory().getRoomType().name());
            payload.put("roomNumber", booking.getRoom() != null ? booking.getRoom().getRoomNumber() : null);
            payload.put("guestName", booking.getUser().getName());
            payload.put("checkIn", booking.getCheckInDate());
            payload.put("checkOut", booking.getCheckOutDate());
            payload.put("numberOfNights", nights);
            payload.put("numberOfGuests", booking.getNumberOfGuests());
            payload.put("pricePerNight", booking.getRoomCategory().getPricePerNight());
            payload.put("roomCost", roomCost);
            payload.put("addOnLines", addOnLines);
            payload.put("addOnTotal", addOnTotal);
            payload.put("taxes", booking.getTaxes());
            payload.put("discount", booking.getDiscount());
            payload.put("totalPrice", booking.getTotalPrice());
            payload.put("bookingState", booking.getBookingState());
            String paymentStatus = paymentRepository.findByBookingBookingId(bookingId).stream()
                    .max(java.util.Comparator.comparing(com.yatrika.entity.Payment::getPaymentId))
                    .map(p -> p.getPaymentStatus().name())
                    .orElse("PENDING");
            payload.put("paymentStatus", paymentStatus);
            payload.put("specialRequests", booking.getSpecialRequests());
            payload.put("bookingTimestamp", booking.getBookingTimestamp());

            return ResponseEntity.ok(payload);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }

    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId) {
        try {
            Booking booking = bookingService.cancelBooking(bookingId);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/owner/{ownerId}/upcoming")
    public List<Booking> getUpcomingBookings(@PathVariable Long ownerId) {
        return bookingService.getBookingsByStateAndOwner(ownerId, BookingState.PAYMENT_PENDING);
    }

    @GetMapping("/owner/{ownerId}")
    public List<BookingView> getAllBookingsForOwner(@PathVariable Long ownerId) {
        return bookingService.getBookingsByOwner(ownerId).stream().map(BookingView::from).toList();
    }

    @GetMapping("/owner/{ownerId}/current")
    public List<Booking> getCurrentGuests(@PathVariable Long ownerId) {
        return bookingService.getBookingsByStateAndOwner(ownerId, BookingState.CHECKED_IN);
    }

    @GetMapping("/owner/{ownerId}/completed")
    public List<Booking> getCompletedBookings(@PathVariable Long ownerId) {
        return bookingService.getBookingsByStateAndOwner(ownerId, BookingState.COMPLETED);
    }

    @GetMapping("/owner/{ownerId}/cancelled")
    public List<Booking> getCancelledBookings(@PathVariable Long ownerId) {
        return bookingService.getBookingsByStateAndOwner(ownerId, BookingState.CANCELLED);
    }

    @GetMapping("/users/{userId}/bookings")
    public List<Booking> getBookingsForUser(@PathVariable Long userId) {
        return bookingRepository.findByUserUserId(userId);
    }

    // Uses com.yatrika.dto.BookingRequest DTO
}
