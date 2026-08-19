package com.yatrika.servicesImpl;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.yatrika.dto.RecommendationResponse;
import com.yatrika.entity.Booking;
import com.yatrika.entity.Hotel;
import com.yatrika.entity.User;
import com.yatrika.enums.Amenities;
import com.yatrika.enums.BookingState;
import com.yatrika.enums.HotelCategory;
import com.yatrika.enums.TravelType;
import com.yatrika.repository.BookingRepository;
import com.yatrika.repository.HotelRepository;
import com.yatrika.repository.UserRepository;
import com.yatrika.servives.RecommendationService;

@Service
public class RecommendationServiceImpl implements RecommendationService {

    private final HotelRepository hotelRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public RecommendationServiceImpl(HotelRepository hotelRepository, BookingRepository bookingRepository, UserRepository userRepository) {
        this.hotelRepository = hotelRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<RecommendationResponse> findRecommendations(String city,
            HotelCategory category,
            Double budget,
            Double minRating,
            Set<Amenities> amenities,
            TravelType travelType) {
        
        List<Hotel> allHotels = hotelRepository.findAll();
        List<Booking> pastBookings = getPastBookingsForCurrentUser();

        // 1. Compute User Preference Profile dynamically
        UserPreference profile = buildProfile(pastBookings, city, category, budget, minRating, amenities, travelType);

        // 2. Score and sort
        return allHotels.stream()
                .filter(hotel -> city == null || hotel.getCity().equalsIgnoreCase(city)) // Fallback behavior for city
                .map(hotel -> scoreHotel(hotel, profile, category, budget, minRating, amenities))
                .sorted(Comparator.comparingDouble(RecommendationResponse::getMatchScore).reversed())
                .collect(Collectors.toList());
    }

    private List<Booking> getPastBookingsForCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            String email = auth.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                return bookingRepository.findByUserUserId(userOpt.get().getUserId()).stream()
                        .filter(b -> b.getBookingState() == BookingState.CONFIRMED || b.getBookingState() == BookingState.COMPLETED)
                        .collect(Collectors.toList());
            }
        }
        return Collections.emptyList();
    }

    private record UserPreference(
        String preferredCity,
        HotelCategory preferredCategory,
        Double preferredBudget,
        Double preferredRating,
        Set<Amenities> preferredAmenities,
        TravelType preferredTravelType,
        boolean isColdStart
    ) {}

    private UserPreference buildProfile(List<Booking> bookings, String reqCity, HotelCategory reqCat, Double reqBudget, Double reqRating, Set<Amenities> reqAmenities, TravelType reqTravel) {
        if (bookings.isEmpty()) {
            return new UserPreference(reqCity, reqCat, reqBudget, reqRating, reqAmenities, reqTravel, true);
        }
        
        Map<String, Long> cityCounts = bookings.stream().collect(Collectors.groupingBy(b -> b.getHotel().getCity(), Collectors.counting()));
        String prefCity = cityCounts.entrySet().stream().max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse(reqCity);
        
        Map<HotelCategory, Long> catCounts = bookings.stream().collect(Collectors.groupingBy(b -> b.getHotel().getCategory(), Collectors.counting()));
        HotelCategory prefCat = catCounts.entrySet().stream().max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse(reqCat);
        
        double avgBudget = bookings.stream().mapToDouble(Booking::getTotalPrice).average().orElse(reqBudget != null ? reqBudget : 5000.0);
        
        Set<Amenities> prefAmenities = new HashSet<>();
        bookings.forEach(b -> prefAmenities.addAll(b.getHotel().getAmenities()));
        if (reqAmenities != null) prefAmenities.addAll(reqAmenities);
        
        return new UserPreference(prefCity, prefCat, avgBudget, reqRating != null ? reqRating : 4.0, prefAmenities, reqTravel, false);
    }

    private static final String DEFAULT_IMAGE = "https://images.unsplash.com/photo-1505691723518-36d6b4b7ca6a?auto=format&fit=crop&w=1200&q=80";

    private RecommendationResponse scoreHotel(Hotel hotel, UserPreference profile, HotelCategory reqCat, Double reqBudget, Double reqRating, Set<Amenities> reqAmenities) {
        // Personal Recommendation Score (0 to 1.0)
        double historySimilarity = calculateHistorySimilarity(hotel, profile) * 0.35;
        double travelTypeMatch = calculateTravelTypeMatch(hotel.getCategory(), profile.preferredTravelType()) * 0.20;
        double amenityMatch = calculateAmenityMatch(hotel.getAmenities(), profile.preferredAmenities()) * 0.15;
        double budgetMatch = calculateBudgetMatch(hotel.getPricePerNight(), profile.preferredBudget()) * 0.10;
        double ratingScore = normalizeRating(hotel.getAvgRating()) * 0.10;
        double popularityScore = normalizePopularity(hotel.getReviewCount()) * 0.05;
        double locationMatch = (profile.preferredCity() != null && profile.preferredCity().equalsIgnoreCase(hotel.getCity())) ? 0.05 : 0.0;

        double personalScore = historySimilarity + travelTypeMatch + amenityMatch + budgetMatch + ratingScore + popularityScore + locationMatch;

        // Current Search Match Score (0 to 100)
        double matchScore = calculateMatchScore(hotel, reqCat, reqBudget, reqRating, reqAmenities);
        double finalCombinedScore = matchScore + (personalScore * 10); // Incorporate personal preference into final sort

        String explanation = generateExplanation(historySimilarity, travelTypeMatch, amenityMatch, budgetMatch, ratingScore, popularityScore, locationMatch, profile, matchScore, reqCat);

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        if (reqAmenities != null) {
            for (Amenities a : reqAmenities) {
                if (hotel.getAmenities().contains(a)) matched.add(a.name());
                else missing.add(a.name());
            }
        }

        String imageUrl = hotel.getImageUrl() != null && !hotel.getImageUrl().isBlank() ? hotel.getImageUrl() : DEFAULT_IMAGE;

        return new RecommendationResponse(
                hotel.getHotelId(),
                hotel.getName(),
                hotel.getCity(),
                hotel.getCategory(),
                hotel.getAvgRating(),
                hotel.getPricePerNight(),
                hotel.getAmenities(),
                Math.round(personalScore * 100.0) / 100.0,
                Math.round(finalCombinedScore * 10.0) / 10.0,
                matched,
                missing,
                imageUrl,
                explanation);
    }

    private double calculateMatchScore(Hotel hotel, HotelCategory reqCat, Double reqBudget, Double reqRating, Set<Amenities> reqAmenities) {
        double score = 100.0;
        if (reqCat != null && hotel.getCategory() != reqCat) score -= 15.0;
        if (reqBudget != null && hotel.getPricePerNight() > reqBudget) score -= 15.0;
        if (reqRating != null && hotel.getAvgRating() < reqRating) score -= 10.0;
        
        if (reqAmenities != null && !reqAmenities.isEmpty()) {
            double penaltyPerMissing = 40.0 / reqAmenities.size();
            for (Amenities a : reqAmenities) {
                if (!hotel.getAmenities().contains(a)) {
                    score -= penaltyPerMissing;
                }
            }
        }
        return Math.max(0, score);
    }

    private double calculateHistorySimilarity(Hotel hotel, UserPreference profile) {
        if (profile.isColdStart()) return 0.5; // Neutral
        double sim = 0.0;
        if (hotel.getCategory() == profile.preferredCategory()) sim += 0.5;
        if (hotel.getCity().equalsIgnoreCase(profile.preferredCity())) sim += 0.5;
        return sim;
    }

    private double calculateTravelTypeMatch(HotelCategory hotelCategory, TravelType travelType) {
        if (travelType == null || hotelCategory == null) return 1.0;
        HotelCategory preferredCategory = switch (travelType) {
            case SOLO -> HotelCategory.BUDGET;
            case COUPLE -> HotelCategory.LUXURY;
            case FAMILY -> HotelCategory.RESORT;
            case BUSINESS -> HotelCategory.BUSINESS;
        };
        return hotelCategory == preferredCategory ? 1.0 : 0.5;
    }

    private double calculateAmenityMatch(Set<Amenities> hotelAmenities, Set<Amenities> prefAmenities) {
        if (prefAmenities == null || prefAmenities.isEmpty()) return 1.0;
        if (hotelAmenities == null || hotelAmenities.isEmpty()) return 0.0;
        long match = prefAmenities.stream().filter(hotelAmenities::contains).count();
        return (double) match / prefAmenities.size();
    }

    private double calculateBudgetMatch(Double price, Double budget) {
        if (budget == null || price == null || price <= 0) return 1.0;
        return Math.min(1.0, budget / price);
    }

    private double normalizeRating(Double rating) {
        if (rating == null || rating <= 0) return 0.0;
        return Math.min(1.0, rating / 5.0);
    }

    private double normalizePopularity(Integer count) {
        if (count == null || count <= 0) return 0.0;
        return Math.min(1.0, count / 50.0);
    }

    private String generateExplanation(double hist, double travel, double amenity, double budget, double rating, double pop, double loc, UserPreference profile, double matchScore, HotelCategory reqCat) {
        if (matchScore >= 95) return "Perfect match for your search.";
        if (matchScore >= 80 && reqCat != null) return "Great " + reqCat.name() + " choice based on your filters.";
        
        if (profile.isColdStart()) {
            if (loc > 0) return "Excellent choice in your preferred location.";
            if (travel >= 0.15) return "Perfect for your travel style.";
            if (rating >= 0.08) return "Highly rated by travellers.";
            return "A great starting point for your journey.";
        }
        
        // Find highest contributor
        double max = Math.max(hist, Math.max(amenity, Math.max(budget, loc)));
        if (max == hist && hist > 0) return "Similar to your previous stay in " + profile.preferredCity() + ".";
        if (max == loc && loc > 0) return "Trending in your favourite city, " + profile.preferredCity() + ".";
        if (max == amenity && amenity > 0) return "Contains your favourite amenities.";
        if (max == budget && budget > 0) return "Matches your preferred budget.";
        
        return "Recommended based on your booking history.";
    }
}
