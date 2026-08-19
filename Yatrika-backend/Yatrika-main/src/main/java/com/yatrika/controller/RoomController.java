package com.yatrika.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yatrika.entity.Room;
import com.yatrika.entity.RoomCategory;
import com.yatrika.servives.RoomService;

import jakarta.validation.Valid;

@RestController
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping("/api/hotels/{hotelId}/owner/{ownerId}/room-categories")
    public RoomCategory addRoomCategory(@PathVariable Long hotelId,
                                        @PathVariable Long ownerId,
                                        @RequestParam(required = false, defaultValue = "1") Integer quantity,
                                        @Valid @RequestBody RoomCategory roomCategory) {
        return roomService.addRoomCategory(ownerId, hotelId, roomCategory, quantity);
    }

    @GetMapping("/api/hotels/{hotelId}/room-categories")
    public List<RoomCategory> getRoomCategoriesByHotelId(@PathVariable Long hotelId) {
        return roomService.getRoomCategoriesByHotelId(hotelId);
    }

    @GetMapping("/api/hotels/{hotelId}/owner/{ownerId}/room-categories")
    public List<RoomCategory> getOwnerRoomCategories(@PathVariable Long hotelId,
                                                    @PathVariable Long ownerId) {
        return roomService.getOwnerRoomCategories(ownerId, hotelId);
    }

    @PutMapping("/api/room-categories/owner/{ownerId}/{roomCategoryId}")
    public RoomCategory updateRoomCategory(@PathVariable Long ownerId,
                                           @PathVariable Long roomCategoryId,
                                           @RequestParam(required = false) Integer quantity,
                                           @Valid @RequestBody RoomCategory roomCategory) {
        return roomService.updateRoomCategory(ownerId, roomCategoryId, roomCategory, quantity);
    }

    @DeleteMapping("/api/room-categories/owner/{ownerId}/{roomCategoryId}")
    public String deleteRoomCategory(@PathVariable Long ownerId,
                                     @PathVariable Long roomCategoryId) {
        roomService.deleteRoomCategory(ownerId, roomCategoryId);
        return "Room category deleted successfully";
    }

    @GetMapping("/api/hotels/{hotelId}/rooms")
    public List<Room> getRoomsByHotelId(@PathVariable Long hotelId) {
        return roomService.getRoomsByHotelId(hotelId);
    }

    @GetMapping("/api/rooms/{roomId}")
    public Room getRoomById(@PathVariable Long roomId) {
        return roomService.getRoomById(roomId);
    }
}
