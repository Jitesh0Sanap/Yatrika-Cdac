package com.yatrika.servives;

import org.springframework.data.domain.Page;
import com.yatrika.dto.AdminDashboardResponse;
import com.yatrika.dto.BookingView;
import com.yatrika.enums.BookingState;

public interface AdminService {
    AdminDashboardResponse getDashboard(Long adminId);
    Page<AdminDashboardResponse.UserSummary> getPaginatedUsers(Long adminId, int page, int size);
    Page<AdminDashboardResponse.HotelSummary> getPaginatedHotels(Long adminId, int page, int size);
    Page<BookingView> getPaginatedBookings(Long adminId, int page, int size, BookingState state);
    BookingView updateBookingState(Long adminId, Long bookingId, BookingState bookingState);
}
