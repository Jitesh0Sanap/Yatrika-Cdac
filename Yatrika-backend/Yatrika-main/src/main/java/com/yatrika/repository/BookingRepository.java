package com.yatrika.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.yatrika.entity.Booking;
import com.yatrika.entity.Room;
import com.yatrika.enums.BookingState;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Page<Booking> findByBookingState(BookingState bookingState, Pageable pageable);

    @Query("select b from Booking b where b.room = :room and b.bookingState in :activeStates and " +
           "((b.checkInDate < :checkOutDate) and (b.checkOutDate > :checkInDate))")
    List<Booking> findConflictingBookings(@Param("room") Room room,
                                          @Param("checkInDate") LocalDate checkInDate,
                                          @Param("checkOutDate") LocalDate checkOutDate,
                                          @Param("activeStates") List<BookingState> activeStates);

       java.util.List<Booking> findByUserUserId(Long userId);
}
