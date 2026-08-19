package com.yatrika.servives;


import java.util.List;

import com.yatrika.entity.Hotel;
import com.yatrika.enums.HotelCategory;

public interface HotelService {

    Hotel createHotel(Long ownerId, Hotel hotel);

    List<Hotel> getAllHotels();

    Hotel getHotelById(Long hotelId);

    List<Hotel> searchHotels(String city, HotelCategory category);

    List<Hotel> getHotelsByOwnerId(Long ownerId);

    Hotel updateHotel(Long ownerId, Long hotelId, Hotel hotel);

    void deleteHotel(Long ownerId, Long hotelId);

    java.util.List<com.yatrika.entity.HotelAddOn> getHotelAddOns(Long ownerId, Long hotelId);

    com.yatrika.entity.HotelAddOn createOrUpdateHotelAddOn(Long ownerId, Long hotelId, com.yatrika.dto.HotelAddOnRequest req);

    void deleteHotelAddOn(Long ownerId, Long hotelId, Long addOnId);
}


