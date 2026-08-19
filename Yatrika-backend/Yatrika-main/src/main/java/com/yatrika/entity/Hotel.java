package com.yatrika.entity;


import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.yatrika.enums.Amenities;
import com.yatrika.enums.HotelCategory;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hotels")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hotel {

    @Id
    @Column(name = "hotel_id", length = 36, updatable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long hotelId;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnore
    private User owner;
    
    
    @NotBlank
    @Column(nullable = false, length = 150)
    private String name;

    @NotBlank
    @Column(nullable = false, length = 255)
    private String location;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String city;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private HotelCategory category;

    @NotEmpty
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "hotel_amenities", joinColumns = @JoinColumn(name = "hotel_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "amenity", nullable = false, length = 50)
    @Builder.Default
    private Set<Amenities> amenities = new HashSet<>();

    @NotNull
    @Column(name = "price_per_night", nullable = false)
    private Double pricePerNight;

    // Updated by review-service after a new review.
    @Column(name = "avg_rating")
    private Double avgRating;

    @Column(name = "review_count")
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(length = 200)
    private String tagline;

    @Column(length = 2000)
    private String about;

    @Column(name = "distance_from_airport")
    private Double distanceFromAirport;

    @Column(name = "distance_from_city_center")
    private Double distanceFromCityCenter;

    @Column(name = "established_year")
    private Integer establishedYear;

    @JsonIgnore
    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Room> rooms = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RoomCategory> roomCategories = new ArrayList<>();

    @Transient
    private Double minRoomPrice;

    @Transient
    private Long roomCategoryCount;

    @JsonIgnore
    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.Set<HotelAddOn> hotelAddOns = new java.util.HashSet<>();
}
