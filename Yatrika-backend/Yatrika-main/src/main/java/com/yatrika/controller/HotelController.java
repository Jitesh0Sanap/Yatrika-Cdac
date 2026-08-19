package com.yatrika.controller;



import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yatrika.entity.Hotel;
import com.yatrika.enums.HotelCategory;
import com.yatrika.servives.HotelService;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    private final HotelService hotelService;
    private final com.yatrika.repository.HotelAddOnRepository hotelAddOnRepository;

    public HotelController(HotelService hotelService, com.yatrika.repository.HotelAddOnRepository hotelAddOnRepository) {
        this.hotelService = hotelService;
        this.hotelAddOnRepository = hotelAddOnRepository;
    }

    // Hotel owner creates a hotel
    @PostMapping("/owner/{ownerId}")
    public Hotel createHotel(@PathVariable Long ownerId,
                              @RequestBody Hotel hotel) {
        return hotelService.createHotel(ownerId, hotel);
    }

    // Anyone can view all hotels
    @GetMapping
    public List<Hotel> getAllHotels() {
        return hotelService.getAllHotels();
    }

    // Anyone can search hotels by city and/or category
    @GetMapping("/search")
    public List<Hotel> searchHotels(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) HotelCategory category) {

        return hotelService.searchHotels(city, category);
    }

    // Hotel owner can view their own hotels
    @GetMapping("/owner/{ownerId}")
    public List<Hotel> getHotelsByOwnerId(@PathVariable Long ownerId) {
        return hotelService.getHotelsByOwnerId(ownerId);
    }

    // Anyone can view one hotel
    @GetMapping("/{hotelId}")
    public Hotel getHotelById(@PathVariable Long hotelId) {
        return hotelService.getHotelById(hotelId);
    }

    // Get add-ons supported by a hotel
    @GetMapping("/{hotelId}/addons")
    public java.util.List<com.yatrika.entity.HotelAddOn> getHotelAddOns(@PathVariable Long hotelId) {
        Hotel h = hotelService.getHotelById(hotelId);
        return hotelAddOnRepository.findByHotelHotelId(h.getHotelId());
    }

    // Owner endpoints for managing hotel add-ons
    @GetMapping("/{hotelId}/owner/{ownerId}/addons")
    public java.util.List<com.yatrika.entity.HotelAddOn> getOwnerHotelAddOns(@PathVariable Long ownerId, @PathVariable Long hotelId) {
        return hotelService.getHotelAddOns(ownerId, hotelId);
    }

    @PostMapping("/{hotelId}/owner/{ownerId}/addons")
    public com.yatrika.entity.HotelAddOn createHotelAddOn(@PathVariable Long ownerId, @PathVariable Long hotelId, @RequestBody com.yatrika.dto.HotelAddOnRequest req) {
        return hotelService.createOrUpdateHotelAddOn(ownerId, hotelId, req);
    }

    @PutMapping("/{hotelId}/owner/{ownerId}/addons/{addOnId}")
    public com.yatrika.entity.HotelAddOn updateHotelAddOn(@PathVariable Long ownerId, @PathVariable Long hotelId, @PathVariable Long addOnId, @RequestBody com.yatrika.dto.HotelAddOnRequest req) {
        req.addOnId = addOnId;
        return hotelService.createOrUpdateHotelAddOn(ownerId, hotelId, req);
    }

    @DeleteMapping("/{hotelId}/owner/{ownerId}/addons/{addOnId}")
    public String deleteHotelAddOn(@PathVariable Long ownerId, @PathVariable Long hotelId, @PathVariable Long addOnId) {
        hotelService.deleteHotelAddOn(ownerId, hotelId, addOnId);
        return "Hotel add-on removed";
    }

    // Hotel owner updates a hotel
    @PutMapping("/owner/{ownerId}/{hotelId}")
    public Hotel updateHotel(@PathVariable Long ownerId,
                             @PathVariable Long hotelId,
                             @RequestBody Hotel hotel) {
        return hotelService.updateHotel(ownerId, hotelId, hotel);
    }

    // Hotel owner deletes their own hotel
    @DeleteMapping("/owner/{ownerId}/{hotelId}")
    public String deleteHotel(@PathVariable Long ownerId,
                              @PathVariable Long hotelId) {
        hotelService.deleteHotel(ownerId, hotelId);
        return "Hotel deleted successfully";
    }
}
