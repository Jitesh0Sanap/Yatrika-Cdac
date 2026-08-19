package com.yatrika.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yatrika.entity.AddOn;
import com.yatrika.repository.AddOnRepository;

@RestController
@RequestMapping("/api/addons")
public class AddOnController {

    private final AddOnRepository addOnRepository;

    public AddOnController(AddOnRepository addOnRepository) {
        this.addOnRepository = addOnRepository;
    }

    @GetMapping
    public List<AddOn> getAllAddOns() {
        return addOnRepository.findAll();
    }
}
