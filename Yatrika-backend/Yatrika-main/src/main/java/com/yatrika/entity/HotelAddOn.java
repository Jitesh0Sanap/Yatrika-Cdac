package com.yatrika.entity;

import com.yatrika.enums.PricingType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hotel_addons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelAddOn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "hotel_addon_id")
    private Long hotelAddOnId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hotel_id", nullable = false)
    @NotNull
    private Hotel hotel;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "addon_id", nullable = false)
    @NotNull
    private AddOn addOn;

    @NotNull
    @Column(nullable = false)
    private Double price;

    @NotNull
    @Column(name = "pricing_type", nullable = false, length = 40)
    private PricingType pricingType;

    @NotNull
    @Column(nullable = false)
    private Boolean enabled = Boolean.TRUE;

    @NotNull
    @Column(nullable = false)
    private Boolean included = Boolean.FALSE;
}
