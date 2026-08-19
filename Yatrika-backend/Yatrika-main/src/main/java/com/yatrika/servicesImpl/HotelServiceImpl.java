package com.yatrika.servicesImpl;



import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.yatrika.entity.Hotel;
import com.yatrika.entity.User;
import com.yatrika.enums.HotelCategory;
import com.yatrika.repository.HotelRepository;
import com.yatrika.repository.UserRepository;
import com.yatrika.repository.HotelAddOnRepository;
import com.yatrika.repository.AddOnRepository;
import com.yatrika.dto.HotelAddOnRequest;
import com.yatrika.servives.HotelService;

import com.yatrika.config.Loggable;

@Service
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final HotelAddOnRepository hotelAddOnRepository;
    private final AddOnRepository addOnRepository;

    public HotelServiceImpl(HotelRepository hotelRepository,
                            UserRepository userRepository,
                            HotelAddOnRepository hotelAddOnRepository,
                            AddOnRepository addOnRepository) {
        this.hotelRepository = hotelRepository;
        this.userRepository = userRepository;
        this.hotelAddOnRepository = hotelAddOnRepository;
        this.addOnRepository = addOnRepository;
    }

    @Override
    @Loggable
    public Hotel createHotel(Long ownerId, Hotel hotel) {

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        verifyHotelOwner(owner);

        hotel.setOwner(owner);

        return hotelRepository.save(hotel);
    }

    @Override
    public List<Hotel> getAllHotels() {
        List<Hotel> hotels = hotelRepository.findAllWithRoomCategories();
        hotels.forEach(this::populateHotelInventorySummary);
        return hotels;
    }

    @Override
    public Hotel getHotelById(Long hotelId) {
        Hotel hotel = hotelRepository.findByIdWithRoomCategories(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));
        populateHotelInventorySummary(hotel);
        return hotel;
    }

    @Override
    public List<Hotel> searchHotels(String city, HotelCategory category) {

        if (city != null && category != null) {
            return hotelRepository.findByCityIgnoreCaseAndCategory(city, category);
        }

        if (city != null) {
            return hotelRepository.findByCityIgnoreCase(city);
        }

        if (category != null) {
            return hotelRepository.findByCategory(category);
        }

        return hotelRepository.findAll();
    }

    @Override
    public List<Hotel> getHotelsByOwnerId(Long ownerId) {
        return hotelRepository.findByOwnerUserIdWithRoomCategories(ownerId);
    }

    @Override
    @Loggable
    public Hotel updateHotel(Long ownerId, Long hotelId, Hotel newHotel) {

        Hotel hotel = getOwnedHotel(ownerId, hotelId);

        hotel.setName(newHotel.getName());
        hotel.setLocation(newHotel.getLocation());
        hotel.setCity(newHotel.getCity());
        hotel.setCategory(newHotel.getCategory());
        hotel.setAmenities(newHotel.getAmenities());
        hotel.setPricePerNight(newHotel.getPricePerNight());
        hotel.setImageUrl(newHotel.getImageUrl());

        return hotelRepository.save(hotel);
    }

    @Override
    @Loggable
    public void deleteHotel(Long ownerId, Long hotelId) {
        hotelRepository.delete(getOwnedHotel(ownerId, hotelId));
    }

    private Hotel getOwnedHotel(Long ownerId, Long hotelId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Owner not found"));

        verifyHotelOwner(owner);

        Hotel hotel = getHotelById(hotelId);
        if (!hotel.getOwner().getUserId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot manage another owner's hotel");
        }

        return hotel;
    }

    private void populateHotelInventorySummary(Hotel hotel) {
        if (hotel.getRoomCategories() == null || hotel.getRoomCategories().isEmpty()) {
            hotel.setMinRoomPrice(null);
            hotel.setRoomCategoryCount(0L);
            return;
        }

        hotel.setRoomCategoryCount((long) hotel.getRoomCategories().size());
        hotel.setMinRoomPrice(hotel.getRoomCategories().stream()
                .filter(category -> category.getPricePerNight() != null)
                .mapToDouble(category -> category.getPricePerNight())
                .min()
                .orElse(0.0));
    }

    private void verifyHotelOwner(User owner) {
        if (owner.getRole() != com.yatrika.enums.Role.HOTEL_OWNER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only hotel owners can manage hotels");
        }
    }

    @Override
    public java.util.List<com.yatrika.entity.HotelAddOn> getHotelAddOns(Long ownerId, Long hotelId) {
        Hotel hotel = getOwnedHotel(ownerId, hotelId);
        return hotelAddOnRepository.findByHotelHotelId(hotel.getHotelId());
    }

    @Override
    @Loggable
    public com.yatrika.entity.HotelAddOn createOrUpdateHotelAddOn(Long ownerId, Long hotelId, HotelAddOnRequest req) {
        Hotel hotel = getOwnedHotel(ownerId, hotelId);

        if (req.price == null || req.price < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price must be non-negative");
        }
        if (req.pricingType == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pricing type is required");
        }

        com.yatrika.entity.AddOn addOn = addOnRepository.findById(req.addOnId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Add-on not found"));

        com.yatrika.entity.HotelAddOn existing = hotelAddOnRepository.findByHotelHotelIdAndAddOnAddOnId(hotel.getHotelId(), req.addOnId)
                .orElse(null);

        if (existing == null) {
            com.yatrika.entity.HotelAddOn hao = com.yatrika.entity.HotelAddOn.builder()
                    .hotel(hotel)
                    .addOn(addOn)
                    .price(req.price)
                    .pricingType(req.pricingType)
                    .enabled(req.enabled == null ? Boolean.TRUE : req.enabled)
                    .included(req.included == null ? Boolean.FALSE : req.included)
                    .build();
            return hotelAddOnRepository.save(hao);
        } else {
            existing.setPrice(req.price);
            existing.setPricingType(req.pricingType);
            existing.setEnabled(req.enabled == null ? existing.getEnabled() : req.enabled);
            existing.setIncluded(req.included == null ? existing.getIncluded() : req.included);
            return hotelAddOnRepository.save(existing);
        }
    }

    @Override
    @Loggable
    public void deleteHotelAddOn(Long ownerId, Long hotelId, Long addOnId) {
        Hotel hotel = getOwnedHotel(ownerId, hotelId);
        com.yatrika.entity.HotelAddOn existing = hotelAddOnRepository.findByHotelHotelIdAndAddOnAddOnId(hotel.getHotelId(), addOnId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel add-on not found"));
        hotelAddOnRepository.delete(existing);
    }
}
