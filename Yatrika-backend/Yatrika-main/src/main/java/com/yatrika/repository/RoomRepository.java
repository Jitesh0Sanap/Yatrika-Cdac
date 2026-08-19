package com.yatrika.repository;


import com.yatrika.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.yatrika.enums.BookingStatus;

public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByHotelHotelId(Long hotelId);

    long countByRoomCategoryRoomCategoryId(Long roomCategoryId);

    long countByRoomCategoryRoomCategoryIdAndBookingStatus(Long roomCategoryId, BookingStatus bookingStatus);
}