package com.yatrika.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yatrika.dto.AdminDashboardResponse;
import com.yatrika.dto.BookingView;
import com.yatrika.enums.BookingState;
import com.yatrika.servives.AdminService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/{adminId}/dashboard")
    public AdminDashboardResponse getDashboard(@PathVariable Long adminId) {
        return adminService.getDashboard(adminId);
    }

    @GetMapping("/{adminId}/users")
    public org.springframework.data.domain.Page<AdminDashboardResponse.UserSummary> getPaginatedUsers(
            @PathVariable Long adminId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return adminService.getPaginatedUsers(adminId, page, size);
    }

    @GetMapping("/{adminId}/hotels")
    public org.springframework.data.domain.Page<AdminDashboardResponse.HotelSummary> getPaginatedHotels(
            @PathVariable Long adminId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return adminService.getPaginatedHotels(adminId, page, size);
    }

    @GetMapping("/{adminId}/bookings")
    public org.springframework.data.domain.Page<BookingView> getPaginatedBookings(
            @PathVariable Long adminId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) BookingState state) {
        return adminService.getPaginatedBookings(adminId, page, size, state);
    }

    @PutMapping("/{adminId}/bookings/{bookingId}/state")
    public BookingView updateBookingState(@PathVariable Long adminId, @PathVariable Long bookingId,
            @RequestParam BookingState state) {
        return adminService.updateBookingState(adminId, bookingId, state);
    }
}
