package com.yatrika.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yatrika.entity.HotelAddOn;

public interface HotelAddOnRepository extends JpaRepository<HotelAddOn, Long> {
    List<HotelAddOn> findByHotelHotelId(Long hotelId);
    java.util.Optional<HotelAddOn> findByHotelHotelIdAndAddOnAddOnId(Long hotelId, Long addOnId);
}
