package com.yatrika.servicesImpl;

import java.util.Comparator;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.yatrika.dto.AdminDashboardResponse;
import com.yatrika.dto.BookingView;
import com.yatrika.entity.Booking;
import com.yatrika.entity.User;
import com.yatrika.enums.BookingState;
import com.yatrika.enums.Role;
import com.yatrika.repository.BookingRepository;
import com.yatrika.repository.HotelRepository;
import com.yatrika.repository.RoomCategoryRepository;
import com.yatrika.repository.RoomRepository;
import com.yatrika.repository.UserRepository;
import com.yatrika.servives.AdminService;

import com.yatrika.config.Loggable;

@Service
public class AdminServiceImpl implements AdminService {
    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final RoomCategoryRepository roomCategoryRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    public AdminServiceImpl(UserRepository userRepository, HotelRepository hotelRepository,
            RoomCategoryRepository roomCategoryRepository, RoomRepository roomRepository,
            BookingRepository bookingRepository) {
        this.userRepository = userRepository;
        this.hotelRepository = hotelRepository;
        this.roomCategoryRepository = roomCategoryRepository;
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard(Long adminId) {
        requireAdmin(adminId);
        return new AdminDashboardResponse(userRepository.count(), hotelRepository.count(),
                roomCategoryRepository.count(), roomRepository.count(), bookingRepository.count());
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<AdminDashboardResponse.UserSummary> getPaginatedUsers(Long adminId, int page, int size) {
        requireAdmin(adminId);
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("userId"));
        return userRepository.findAll(pageable)
                .map(user -> new AdminDashboardResponse.UserSummary(user.getUserId(), user.getName(),
                        user.getEmail(), user.getPhone(), user.getRole()));
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<AdminDashboardResponse.HotelSummary> getPaginatedHotels(Long adminId, int page, int size) {
        requireAdmin(adminId);
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("hotelId"));
        return hotelRepository.findAll(pageable)
                .map(hotel -> new AdminDashboardResponse.HotelSummary(hotel.getHotelId(), hotel.getName(),
                        hotel.getCity(), hotel.getCategory().name(), hotel.getAvgRating(),
                        hotel.getOwner().getName(), hotel.getOwner().getEmail()));
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<BookingView> getPaginatedBookings(Long adminId, int page, int size, BookingState state) {
        requireAdmin(adminId);
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("bookingTimestamp").descending());
        org.springframework.data.domain.Page<Booking> bookingPage;
        if (state != null) {
            bookingPage = bookingRepository.findByBookingState(state, pageable);
        } else {
            bookingPage = bookingRepository.findAll(pageable);
        }
        return bookingPage.map(BookingView::from);
    }

    @Override
    @Transactional
    @Loggable
    public BookingView updateBookingState(Long adminId, Long bookingId, BookingState bookingState) {
        requireAdmin(adminId);
        if (bookingState == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking state is required.");
        }
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found."));
        applyStateTransition(booking, bookingState);
        return BookingView.from(bookingRepository.save(booking));
    }


    private void applyStateTransition(Booking booking, BookingState newState) {
        BookingState current = booking.getBookingState();
        if (current == BookingState.COMPLETED || current == BookingState.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Finalized bookings cannot be changed.");
        }
        if (newState == BookingState.CANCELLED) {
            booking.setBookingState(BookingState.CANCELLED);
            booking.setCancelledAt(java.time.LocalDateTime.now());
            return;
        }
        if (current == BookingState.PAYMENT_PENDING && newState == BookingState.CONFIRMED) {
            booking.setBookingState(BookingState.CONFIRMED);
            booking.setConfirmedAt(java.time.LocalDateTime.now());
            return;
        }
        if (current == BookingState.CONFIRMED && newState == BookingState.CHECKED_IN) {
            booking.setBookingState(BookingState.CHECKED_IN);
            booking.setCheckedInAt(java.time.LocalDateTime.now());
            return;
        }
        if (current == BookingState.CHECKED_IN && newState == BookingState.CHECKED_OUT) {
            booking.setBookingState(BookingState.CHECKED_OUT);
            booking.setCheckedOutAt(java.time.LocalDateTime.now());
            return;
        }
        if (current == BookingState.CHECKED_OUT && newState == BookingState.COMPLETED) {
            booking.setBookingState(BookingState.COMPLETED);
            booking.setCompletedAt(java.time.LocalDateTime.now());
            return;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported booking transition.");
    }

    private void requireAdmin(Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found."));
        if (admin.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access is required.");
        }
    }
}
