package com.yatrika.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yatrika.entity.Hotel;
import com.yatrika.enums.HotelCategory;

public interface HotelRepository extends JpaRepository<Hotel, Long> {

    @Query("select distinct h from Hotel h left join fetch h.roomCategories where h.hotelId = :hotelId")
    Optional<Hotel> findByIdWithRoomCategories(@Param("hotelId") Long hotelId);

    @Query("select distinct h from Hotel h left join fetch h.roomCategories")
    List<Hotel> findAllWithRoomCategories();

    List<Hotel> findByCityIgnoreCase(String city);

    List<Hotel> findByCategory(HotelCategory category);

    List<Hotel> findByCityIgnoreCaseAndCategory(String city,
                                                 HotelCategory category);

    @Query("select distinct h from Hotel h left join fetch h.roomCategories where h.owner.userId = :ownerId")
    List<Hotel> findByOwnerUserIdWithRoomCategories(@Param("ownerId") Long ownerId);
}