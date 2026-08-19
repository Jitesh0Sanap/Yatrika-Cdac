package com.yatrika.servives;

import java.util.List;
import java.util.Set;

import com.yatrika.dto.RecommendationResponse;
import com.yatrika.enums.Amenities;
import com.yatrika.enums.HotelCategory;
import com.yatrika.enums.TravelType;

public interface RecommendationService {

    List<RecommendationResponse> findRecommendations(
            String city,
            HotelCategory category,
            Double budget,
            Double minRating,
            Set<Amenities> amenities,
            TravelType travelType);
}
