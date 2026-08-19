package com.yatrika.dto;

import java.util.Set;

import com.yatrika.enums.Amenities;
import com.yatrika.enums.HotelCategory;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {
    private Long hotelId;
    private String hotelName;
    private String city;
    private HotelCategory category;
    private Double avgRating;
    private Double startingPrice;
    private Set<Amenities> amenities;
    private Double recommendationScore;
    private Double matchScore;
    private java.util.List<String> matchedAmenities;
    private java.util.List<String> missingAmenities;
    private String imageUrl;
    private String recommendationReason;
}
