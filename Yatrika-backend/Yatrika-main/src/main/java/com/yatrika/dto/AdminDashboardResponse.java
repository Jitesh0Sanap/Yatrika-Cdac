package com.yatrika.dto;

import com.yatrika.enums.Role;

public record AdminDashboardResponse(
        long userCount,
        long hotelCount,
        long roomCategoryCount,
        long roomCount,
        long bookingCount) {

    public record UserSummary(Long userId, String name, String email, String phone, Role role) { }

    public record HotelSummary(Long hotelId, String name, String city, String category,
            Double averageRating, String ownerName, String ownerEmail) { }
}
