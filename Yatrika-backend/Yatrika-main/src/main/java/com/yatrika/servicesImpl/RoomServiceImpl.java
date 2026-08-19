package com.yatrika.servicesImpl;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.yatrika.entity.Hotel;
import com.yatrika.entity.Room;
import com.yatrika.entity.RoomCategory;
import com.yatrika.entity.User;
import com.yatrika.enums.Role;
import com.yatrika.repository.HotelRepository;
import com.yatrika.repository.RoomCategoryRepository;
import com.yatrika.repository.RoomRepository;
import com.yatrika.repository.UserRepository;
import com.yatrika.servives.RoomService;

import com.yatrika.config.Loggable;

@Service
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final RoomCategoryRepository roomCategoryRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;

    public RoomServiceImpl(RoomRepository roomRepository,
                           RoomCategoryRepository roomCategoryRepository,
                           HotelRepository hotelRepository,
                           UserRepository userRepository) {
        this.roomRepository = roomRepository;
        this.roomCategoryRepository = roomCategoryRepository;
        this.hotelRepository = hotelRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Loggable
    public RoomCategory addRoomCategory(Long ownerId, Long hotelId, RoomCategory roomCategory, Integer quantity) {
        Hotel hotel = getOwnedHotel(ownerId, hotelId);
        roomCategory.setHotel(hotel);

        RoomCategory savedCategory = roomCategoryRepository.save(roomCategory);

        createRoomsForCategory(savedCategory, quantity == null ? 0 : quantity);

        return savedCategory;
    }

    @Override
    public List<RoomCategory> getRoomCategoriesByHotelId(Long hotelId) {
        List<RoomCategory> categories = roomCategoryRepository.findByHotelHotelId(hotelId);
        categories.forEach(this::populateInventoryCounts);
        return categories;
    }

    @Override
    public List<RoomCategory> getOwnerRoomCategories(Long ownerId, Long hotelId) {
        getOwnedHotel(ownerId, hotelId);
        List<RoomCategory> categories = roomCategoryRepository.findByHotelHotelId(hotelId);
        categories.forEach(this::populateInventoryCounts);
        return categories;
    }

    @Override
    public RoomCategory getRoomCategoryById(Long roomCategoryId) {
        RoomCategory category = roomCategoryRepository.findById(roomCategoryId)
            .orElseThrow(() -> new RuntimeException("Room category not found"));
        populateInventoryCounts(category);
        return category;
    }

    @Override
    @Loggable
    public RoomCategory updateRoomCategory(Long ownerId, Long roomCategoryId, RoomCategory newCategory, Integer quantity) {
        RoomCategory existingCategory = getOwnedRoomCategory(ownerId, roomCategoryId);

        existingCategory.setRoomType(newCategory.getRoomType());
        existingCategory.setPricePerNight(newCategory.getPricePerNight());
        existingCategory.setCapacity(newCategory.getCapacity());
        existingCategory.setDescription(newCategory.getDescription());

        RoomCategory savedCategory = roomCategoryRepository.save(existingCategory);

        if (quantity != null) {
            adjustRoomInventory(savedCategory, quantity);
        }

        populateInventoryCounts(savedCategory);
        return savedCategory;
    }

    @Override
    @Loggable
    public void deleteRoomCategory(Long ownerId, Long roomCategoryId) {
        RoomCategory category = getOwnedRoomCategory(ownerId, roomCategoryId);
        roomCategoryRepository.delete(category);
    }

    @Override
    public List<Room> getRoomsByHotelId(Long hotelId) {
        return roomRepository.findByHotelHotelId(hotelId);
    }

    private void populateInventoryCounts(RoomCategory category) {
        if (category == null || category.getRoomCategoryId() == null) return;
        long total = roomRepository.countByRoomCategoryRoomCategoryId(category.getRoomCategoryId());
        long available = roomRepository.countByRoomCategoryRoomCategoryIdAndBookingStatus(category.getRoomCategoryId(), com.yatrika.enums.BookingStatus.AVAILABLE);
        category.setTotalRooms((int) total);
        category.setAvailableRooms(available);
    }

    @Override
    public Room getRoomById(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
    }

    private void createRoomsForCategory(RoomCategory category, int quantity) {
        List<Room> rooms = new ArrayList<>();
        for (int i = 0; i < quantity; i++) {
            rooms.add(Room.builder()
                    .roomNumber("ROOM-" + UUID.randomUUID())
                    .bookingStatus(com.yatrika.enums.BookingStatus.AVAILABLE)
                    .hotel(category.getHotel())
                    .roomCategory(category)
                    .build());
        }
        roomRepository.saveAll(rooms);
    }

    private void adjustRoomInventory(RoomCategory category, int targetQuantity) {
        int currentQuantity = category.getRooms().size();
        if (targetQuantity < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity cannot be negative");
        }

        if (targetQuantity > currentQuantity) {
            createRoomsForCategory(category, targetQuantity - currentQuantity);
        } else if (targetQuantity < currentQuantity) {
            List<Room> roomsToRemove = new ArrayList<>(category.getRooms().subList(targetQuantity, currentQuantity));
            roomRepository.deleteAll(roomsToRemove);
        }
    }

    private Hotel getOwnedHotel(Long ownerId, Long hotelId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Owner not found"));

        if (owner.getRole() != Role.HOTEL_OWNER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only hotel owners can manage rooms");
        }

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel not found"));

        if (!hotel.getOwner().getUserId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot manage another owner's rooms");
        }

        return hotel;
    }

    private RoomCategory getOwnedRoomCategory(Long ownerId, Long roomCategoryId) {
        RoomCategory category = getRoomCategoryById(roomCategoryId);
        getOwnedHotel(ownerId, category.getHotel().getHotelId());
        return category;
    }
}
