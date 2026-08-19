package com.yatrika.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yatrika.entity.Hotel;
import com.yatrika.entity.RoomCategory;

public interface RoomCategoryRepository extends JpaRepository<RoomCategory, Long> {

    List<RoomCategory> findByHotelHotelId(Long hotelId);

    List<RoomCategory> findByHotel(Hotel hotel);
}
