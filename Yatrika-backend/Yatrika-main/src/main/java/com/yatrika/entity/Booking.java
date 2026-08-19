package com.yatrika.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.yatrika.enums.BookingState;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.FetchType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Long bookingId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_category_id", nullable = false)
    private RoomCategory roomCategory;

    @NotNull
    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;

    @NotNull
    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;

    @Min(1)
    @Column(name = "number_of_guests", nullable = false)
    private Integer numberOfGuests;

    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "booking_state", nullable = false, length = 20)
    private BookingState bookingState = BookingState.PAYMENT_PENDING;

    @NotNull
    @Column(name = "total_price", nullable = false)
    private Double totalPrice;

    @Column(name = "booking_reference", unique = true)
    private String bookingReference;

    @Column(name = "taxes")
    private Double taxes;

    @Column(name = "discount")
    private Double discount;

    @Column(name = "special_requests", length = 2000)
    private String specialRequests;

    @Column(name = "confirmed_at")
    private java.time.LocalDateTime confirmedAt;

    @Column(name = "checked_in_at")
    private java.time.LocalDateTime checkedInAt;

    @Column(name = "checked_out_at")
    private java.time.LocalDateTime checkedOutAt;

    @Column(name = "completed_at")
    private java.time.LocalDateTime completedAt;

    @Column(name = "cancelled_at")
    private java.time.LocalDateTime cancelledAt;

    @NotNull
    @Column(name = "booking_timestamp", nullable = false)
    private LocalDateTime bookingTimestamp;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private java.util.List<BookingAddOn> bookingAddOns;
}
