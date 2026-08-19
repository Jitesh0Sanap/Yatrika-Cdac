package com.yatrika.entity;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.yatrika.enums.RoomType;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
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
import jakarta.persistence.Transient;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "room_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_category_id")
    private Long roomCategoryId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "room_type", nullable = false, length = 30)
    private RoomType roomType;

    @NotNull
    @Positive
    @Column(name = "price_per_night", nullable = false)
    private Double pricePerNight;

    @NotNull
    @Min(1)
    @Column(nullable = false)
    private Integer capacity;

    @NotBlank
    @Column(nullable = false, length = 1000)
    private String description;

    @JsonIgnore
    @OneToMany(mappedBy = "roomCategory", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Room> rooms = new ArrayList<>();

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "room_size", length = 50)
    private String roomSize;

    @Column(name = "bed_type", length = 50)
    private String bedType;

    @Column(name = "view_type", length = 100)
    private String viewType;

    @Column(name = "room_highlights", length = 500)
    private String roomHighlights;

    @Transient
    private Integer totalRooms;

    @Transient
    private Long availableRooms;

    // Transient inventory fields are populated by the service layer to avoid
    // initializing the lazy `rooms` collection during JSON serialization.
}
