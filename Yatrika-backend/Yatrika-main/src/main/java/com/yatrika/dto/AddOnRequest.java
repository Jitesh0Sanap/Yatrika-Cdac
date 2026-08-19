package com.yatrika.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddOnRequest {
    private Long addOnId;
    private Integer quantity = 1;
}
