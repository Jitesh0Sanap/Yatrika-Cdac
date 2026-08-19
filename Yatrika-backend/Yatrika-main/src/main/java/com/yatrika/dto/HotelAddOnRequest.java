package com.yatrika.dto;

import com.yatrika.enums.PricingType;

public class HotelAddOnRequest {
    public Long addOnId;
    public Double price;
    public PricingType pricingType;
    public Boolean enabled;
    public Boolean included;

    public HotelAddOnRequest() {}
}
