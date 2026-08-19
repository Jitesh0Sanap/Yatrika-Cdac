package com.yatrika.servives;

import java.util.List;

import com.yatrika.entity.Room;
import com.yatrika.entity.RoomCategory;

public interface RoomService {

    RoomCategory addRoomCategory(Long ownerId, Long hotelId, RoomCategory roomCategory, Integer quantity);

    List<RoomCategory> getRoomCategoriesByHotelId(Long hotelId);

    List<RoomCategory> getOwnerRoomCategories(Long ownerId, Long hotelId);

    RoomCategory getRoomCategoryById(Long roomCategoryId);

    RoomCategory updateRoomCategory(Long ownerId, Long roomCategoryId, RoomCategory roomCategory, Integer quantity);

    void deleteRoomCategory(Long ownerId, Long roomCategoryId);

    List<Room> getRoomsByHotelId(Long hotelId);

    Room getRoomById(Long roomId);
}
