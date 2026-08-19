package com.yatrika.controller;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yatrika.dto.RecommendationResponse;
import com.yatrika.enums.Amenities;
import com.yatrika.enums.HotelCategory;
import com.yatrika.enums.TravelType;
import com.yatrika.servives.RecommendationService;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping
    public List<RecommendationResponse> getRecommendations(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) HotelCategory category,
            @RequestParam(required = false) Double budget,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) TravelType travelType,
            @RequestParam(required = false) List<String> amenities) {
        Set<Amenities> amenitySet = parseAmenities(amenities);
        return recommendationService.findRecommendations(city, category, budget, minRating, amenitySet, travelType);
    }

    private Set<Amenities> parseAmenities(List<String> amenities) {
        if (amenities == null || amenities.isEmpty()) {
            return Set.of();
        }

        return amenities.stream()
                .filter(Objects::nonNull)
                .flatMap(value -> Arrays.stream(value.split(",")))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .map(String::toUpperCase)
                .map(this::safeParseAmenity)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    private Amenities safeParseAmenity(String value) {
        try {
            return Amenities.valueOf(value);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
