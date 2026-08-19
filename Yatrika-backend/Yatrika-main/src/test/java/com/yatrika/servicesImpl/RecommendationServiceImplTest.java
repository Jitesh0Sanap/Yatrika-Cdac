package com.yatrika.servicesImpl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.yatrika.dto.RecommendationResponse;
import com.yatrika.entity.Hotel;
import com.yatrika.enums.Amenities;
import com.yatrika.enums.HotelCategory;
import com.yatrika.enums.TravelType;
import com.yatrika.repository.HotelRepository;

class RecommendationServiceImplTest {

    @Test
    void shouldReturnTopHotelsSortedByRecommendationScore() {
        HotelRepository hotelRepository = Mockito.mock(HotelRepository.class);

        Hotel luxuryHotel = Hotel.builder()
                .hotelId(1L)
                .name("Romance Resort")
                .city("Goa")
                .category(HotelCategory.LUXURY)
                .pricePerNight(300.0)
                .avgRating(4.8)
                .amenities(Set.of(Amenities.WIFI, Amenities.SPA))
                .build();

        Hotel budgetHotel = Hotel.builder()
                .hotelId(2L)
                .name("Budget Stay")
                .city("Goa")
                .category(HotelCategory.BUDGET)
                .pricePerNight(100.0)
                .avgRating(4.2)
                .amenities(Set.of(Amenities.WIFI))
                .build();

        Hotel businessHotel = Hotel.builder()
                .hotelId(3L)
                .name("Business Hub")
                .city("Bangalore")
                .category(HotelCategory.BUSINESS)
                .pricePerNight(200.0)
                .avgRating(4.5)
                .amenities(Set.of(Amenities.WIFI, Amenities.CONFERENCE_ROOM))
                .build();

        when(hotelRepository.findAll()).thenReturn(List.of(luxuryHotel, budgetHotel, businessHotel));

        RecommendationServiceImpl service = new RecommendationServiceImpl(hotelRepository, Mockito.mock(com.yatrika.repository.BookingRepository.class), Mockito.mock(com.yatrika.repository.UserRepository.class));

        List<RecommendationResponse> recommendations = service.findRecommendations(
                null,
                null,
                null,
                null,
                Set.of(Amenities.WIFI),
                TravelType.COUPLE);

        assertThat(recommendations).hasSize(3);
        assertThat(recommendations.get(0).getHotelId()).isEqualTo(1L);
        assertThat(recommendations.get(1).getHotelId()).isEqualTo(3L);
        assertThat(recommendations.get(2).getHotelId()).isEqualTo(2L);
        assertThat(recommendations.get(0).getRecommendationScore()).isGreaterThan(recommendations.get(1).getRecommendationScore());
        assertThat(recommendations.get(1).getRecommendationScore()).isGreaterThan(recommendations.get(2).getRecommendationScore());
    }

    @Test
    void shouldApplyCityBudgetAndRatingFilters() {
        HotelRepository hotelRepository = Mockito.mock(HotelRepository.class);

        Hotel affordableHotel = Hotel.builder()
                .hotelId(4L)
                .name("Affordable Inn")
                .city("Mumbai")
                .category(HotelCategory.BUDGET)
                .pricePerNight(120.0)
                .avgRating(4.3)
                .amenities(Set.of(Amenities.WIFI))
                .build();

        Hotel expensiveHotel = Hotel.builder()
                .hotelId(5L)
                .name("Expensive Suites")
                .city("Mumbai")
                .category(HotelCategory.LUXURY)
                .pricePerNight(250.0)
                .avgRating(4.9)
                .amenities(Set.of(Amenities.WIFI, Amenities.SPA))
                .build();

        when(hotelRepository.findByCityIgnoreCase("Mumbai")).thenReturn(List.of(affordableHotel, expensiveHotel));

        RecommendationServiceImpl service = new RecommendationServiceImpl(hotelRepository, Mockito.mock(com.yatrika.repository.BookingRepository.class), Mockito.mock(com.yatrika.repository.UserRepository.class));

        List<RecommendationResponse> recommendations = service.findRecommendations(
                "Mumbai",
                null,
                150.0,
                4.0,
                Set.of(Amenities.WIFI),
                null);

        assertThat(recommendations).hasSize(1);
        assertThat(recommendations.get(0).getHotelId()).isEqualTo(4L);
        assertThat(recommendations.get(0).getRecommendationScore()).isGreaterThan(0.0);
    }
}
