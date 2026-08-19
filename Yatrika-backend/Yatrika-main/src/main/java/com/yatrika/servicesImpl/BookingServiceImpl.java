package com.yatrika.servicesImpl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.yatrika.dto.AddOnRequest;
import com.yatrika.dto.BookingSummary;
import com.yatrika.dto.LogEntryRequest;
import com.yatrika.config.Loggable;
import com.yatrika.entity.AddOn;
import com.yatrika.entity.Booking;
import com.yatrika.entity.BookingAddOn;
import com.yatrika.entity.Hotel;
import com.yatrika.entity.HotelAddOn;
import com.yatrika.entity.Room;
import com.yatrika.entity.RoomCategory;
import com.yatrika.entity.User;
import com.yatrika.enums.BookingState;
import com.yatrika.enums.BookingStatus;
import com.yatrika.enums.LogLevel;
import com.yatrika.enums.PricingType;
import com.yatrika.enums.Role;
import com.yatrika.repository.AddOnRepository;
import com.yatrika.repository.BookingRepository;
import com.yatrika.repository.HotelRepository;
import com.yatrika.repository.RoomCategoryRepository;
import com.yatrika.repository.RoomRepository;
import com.yatrika.repository.UserRepository;
import com.yatrika.servives.BookingService;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final RoomCategoryRepository roomCategoryRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final AddOnRepository addOnRepository;
    private final com.yatrika.repository.HotelAddOnRepository hotelAddOnRepository;

    private final LoggingClient loggingClient;

    @PersistenceContext
    private EntityManager entityManager;

    

    @Override
    @Transactional
    @Loggable
    public Booking createBooking(User user, Long hotelId, Long roomCategoryId, LocalDate checkInDate,
                                 LocalDate checkOutDate, Integer numberOfGuests, List<AddOnRequest> addOns) {
        LocalDate today = LocalDate.now();
        if (checkInDate == null || checkOutDate == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-in and check-out dates are required.");
        }
        if (checkInDate.isBefore(today)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-in date cannot be in the past.");
        }
        if (!checkOutDate.isAfter(checkInDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-out date must be after check-in.");
        }

        if (user == null || user.getUserId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A valid user is required.");
        }

        User persistedUser = userRepository.findById(user.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel not found"));

        RoomCategory roomCategory = roomCategoryRepository.findById(roomCategoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room category not found"));

        if (numberOfGuests == null || numberOfGuests < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Guest count must be greater than zero.");
        }
        if (roomCategory.getCapacity() != null && numberOfGuests > roomCategory.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Guest count exceeds room capacity.");
        }

        Room room = findAvailableRoom(hotel.getHotelId(), roomCategory.getRoomCategoryId(), checkInDate, checkOutDate);
        if (room == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No rooms available for the selected dates.");
        }

        long numberOfNights = ChronoUnit.DAYS.between(checkInDate, checkOutDate);
        double roomCost = roomCategory.getPricePerNight() * numberOfNights;
        double addOnsTotal = 0.0;

        List<BookingAddOn> bookingAddOnList = new ArrayList<>();

        if (addOns != null && !addOns.isEmpty()) {
            java.util.Set<Long> seen = new java.util.HashSet<>();
            for (AddOnRequest req : addOns) {
                if (req == null || req.getAddOnId() == null) continue;
                if (seen.contains(req.getAddOnId())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate add-on: " + req.getAddOnId());
                }
                seen.add(req.getAddOnId());

                AddOn addOn = addOnRepository.findById(req.getAddOnId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Add-on not found: " + req.getAddOnId()));

                HotelAddOn hao = hotelAddOnRepository.findByHotelHotelIdAndAddOnAddOnId(hotel.getHotelId(), req.getAddOnId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Add-on not configured for hotel: " + req.getAddOnId()));

                if (hao.getEnabled() == null || !hao.getEnabled()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Add-on not enabled for hotel: " + addOn.getName());
                }

                int quantity = req.getQuantity() == null || req.getQuantity() < 1 ? 1 : req.getQuantity();
                double unitPrice = hao.getIncluded() ? 0.0 : hao.getPrice();
                double thisTotal = 0.0;
                PricingType type = hao.getPricingType();
                switch (type) {
                    case PER_BOOKING -> thisTotal = unitPrice * quantity;
                    case PER_PERSON -> thisTotal = unitPrice * numberOfGuests * quantity;
                    case PER_NIGHT -> thisTotal = unitPrice * numberOfNights * quantity;
                    case PER_PERSON_PER_NIGHT -> thisTotal = unitPrice * numberOfGuests * numberOfNights * quantity;
                    default -> thisTotal = unitPrice * quantity;
                }

                addOnsTotal += thisTotal;

                BookingAddOn bao = BookingAddOn.builder()
                        .addOn(addOn)
                        .quantity(quantity)
                        .unitPrice(unitPrice)
                        .totalPrice(thisTotal)
                    .included(hao.getIncluded() == null ? Boolean.FALSE : hao.getIncluded())
                        .build();
                bookingAddOnList.add(bao);
            }
        }

        double totalPrice = roomCost + addOnsTotal;

        Booking booking = Booking.builder()
                .user(persistedUser)
                .hotel(hotel)
                .room(room)
                .roomCategory(roomCategory)
                .checkInDate(checkInDate)
                .checkOutDate(checkOutDate)
                .numberOfGuests(numberOfGuests)
                .bookingState(BookingState.PAYMENT_PENDING)
                .totalPrice(totalPrice)
                .bookingTimestamp(LocalDateTime.now())
                .build();

        // attach booking to bookingAddOns and set list
        if (!bookingAddOnList.isEmpty()) {
            for (BookingAddOn bao : bookingAddOnList) {
                bao.setBooking(booking);
            }
            booking.setBookingAddOns(bookingAddOnList);
        }

        return bookingRepository.save(booking);
    }

    @Override
    public com.yatrika.dto.BookingSummary previewBooking(com.yatrika.dto.BookingRequest request) {
        // reuse validation logic but do not persist or allocate a specific room
        LocalDate checkInDate = request.checkInDate;
        LocalDate checkOutDate = request.checkOutDate;
        LocalDate today = LocalDate.now();
        if (checkInDate == null || checkOutDate == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-in and check-out dates are required.");
        }
        if (checkInDate.isBefore(today)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-in date cannot be in the past.");
        }
        if (!checkOutDate.isAfter(checkInDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-out date must be after check-in.");
        }

        Hotel hotel = hotelRepository.findById(request.hotelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel not found"));

        RoomCategory roomCategory = roomCategoryRepository.findById(request.roomCategoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room category not found"));

        if (request.numberOfGuests == null || request.numberOfGuests < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Guest count must be greater than zero.");
        }
        if (roomCategory.getCapacity() != null && request.numberOfGuests > roomCategory.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Guest count exceeds room capacity.");
        }

        //ChronoUnit is a Java time unit utility used to calculate the difference between two dates/times.
        long numberOfNights = ChronoUnit.DAYS.between(checkInDate, checkOutDate);
        double roomCost = roomCategory.getPricePerNight() * numberOfNights;

        double addOnsTotal = 0.0;
        List<BookingSummary.AddOnLine> addOnLines = new ArrayList<>();
        if (request.addOns != null && !request.addOns.isEmpty()) {
            Set<Long> seen = new HashSet<>();
            for (AddOnRequest req : request.addOns) {
                if (req == null || req.getAddOnId() == null) continue;
                if (seen.contains(req.getAddOnId())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate add-on: " + req.getAddOnId());
                }
                seen.add(req.getAddOnId());

                AddOn addOn = addOnRepository.findById(req.getAddOnId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Add-on not found: " + req.getAddOnId()));

                HotelAddOn hao = hotelAddOnRepository.findByHotelHotelIdAndAddOnAddOnId(hotel.getHotelId(), req.getAddOnId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Add-on not available for hotel: " + req.getAddOnId()));

                if (hao.getEnabled() == null || !hao.getEnabled()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Add-on not enabled for hotel: " + addOn.getName());
                }

                int quantity = req.getQuantity() == null || req.getQuantity() < 1 ? 1 : req.getQuantity();
                double unitPrice = hao.getIncluded() ? 0.0 : hao.getPrice();
                double thisTotal = 0.0;
                PricingType type = hao.getPricingType();
                switch (type) {
                    case PER_BOOKING -> thisTotal = unitPrice * quantity;
                    case PER_PERSON -> thisTotal = unitPrice * request.numberOfGuests * quantity;
                    case PER_NIGHT -> thisTotal = unitPrice * numberOfNights * quantity;
                    case PER_PERSON_PER_NIGHT -> thisTotal = unitPrice * request.numberOfGuests * numberOfNights * quantity;
                    default -> thisTotal = unitPrice * quantity;
                }

                addOnsTotal += thisTotal;
                addOnLines.add(new BookingSummary.AddOnLine(addOn.getAddOnId(), addOn.getName(), quantity, unitPrice, thisTotal));
            }
        }

        double taxes = 0.0; // placeholder; tax logic can be added later
        double discount = request.discount == null ? 0.0 : request.discount;
        double totalPrice = roomCost + addOnsTotal + taxes - discount;

        com.yatrika.dto.BookingSummary summary = new com.yatrika.dto.BookingSummary();
        summary.bookingId = null;
        summary.hotelId = hotel.getHotelId();
        summary.hotelName = hotel.getName();
        summary.roomCategoryId = roomCategory.getRoomCategoryId();
        summary.roomType = roomCategory.getRoomType() == null ? null : roomCategory.getRoomType().name();
        summary.pricePerNight = roomCategory.getPricePerNight();
        summary.numberOfNights = numberOfNights;
        summary.numberOfGuests = request.numberOfGuests;
        summary.roomCost = roomCost;
        summary.addOnLines = addOnLines;
        summary.addOnTotal = addOnsTotal;
        summary.taxes = taxes;
        summary.totalPrice = totalPrice;
        summary.bookingState = BookingState.PAYMENT_PENDING.name();
        summary.bookingTimestamp = LocalDateTime.now();

        return summary;
    }

    @Override
    @Transactional
    @Loggable
    public com.yatrika.dto.BookingResponse createBookingFromRequest(com.yatrika.dto.BookingRequest request) {
        long start = System.currentTimeMillis();
        try {
            User user = new User();
            user.setUserId(request.userId);
            Booking booking = createBooking(user, request.hotelId, request.roomCategoryId, request.checkInDate, request.checkOutDate, request.numberOfGuests, request.addOns);

            booking.setSpecialRequests(request.specialRequests);
            booking.setDiscount(request.discount == null ? 0.0 : request.discount);
            booking.setTaxes(0.0);
            String ref = generateBookingReference(booking.getBookingId());
            booking.setBookingReference(ref);
            Booking saved = bookingRepository.save(booking);

            // --- direct logging call, booking only ---
            loggingClient.log(LogEntryRequest.builder()
                    .serviceName("Yatrika Booking Service")
                    .moduleName("BookingServiceImpl.createBookingFromRequest")
                    .logLevel(LogLevel.INFORMATION)
                    .message("Booking created: " + ref)
                    .userId(request.userId != null ? request.userId.intValue() : null)
                    .requestUrl("/api/bookings")
                    .httpMethod("POST")
                    .statusCode(201)
                    .executionTime(System.currentTimeMillis() - start)
                    .build());
            
//            System.out.println("### [DEBUG] About to call loggingClient.log() with: " + logEntry);
//            loggingClient.log(logEntry);
            System.out.println("### [DEBUG] loggingClient.log() call returned (fire-and-forget, doesn't mean it succeeded)");

            return new com.yatrika.dto.BookingResponse(saved.getBookingId(), saved.getBookingReference(), saved.getBookingState().name(), saved.getTotalPrice());

        } catch (RuntimeException ex) {
            loggingClient.log(LogEntryRequest.builder()
                    .serviceName("Yatrika Booking Service")
                    .moduleName("BookingServiceImpl.createBookingFromRequest")
                    .logLevel(LogLevel.ERROR)
                    .message(ex.getMessage())
                    .userId(request.userId != null ? request.userId.intValue() : null)
                    .requestUrl("/api/bookings")
                    .httpMethod("POST")
                    .statusCode(400)
                    .executionTime(System.currentTimeMillis() - start)
                    .exceptionMessage(ex.toString())
                    .build());
            throw ex; // keep existing behavior — controller still returns 400
        }
    }

    private String generateBookingReference(Long bookingId) {
        String ts = String.valueOf(System.currentTimeMillis());
        int rnd = (int)(Math.random() * 9000) + 1000;
        return "BK-" + (bookingId == null ? "NA" : bookingId) + "-" + ts.substring(Math.max(0, ts.length()-6)) + "-" + rnd;
    }

    @Override
    public List<Booking> findConflictingBookings(Room room, LocalDate checkInDate, LocalDate checkOutDate) {
        return bookingRepository.findConflictingBookings(room, checkInDate, checkOutDate,
                List.of(BookingState.CONFIRMED, BookingState.CHECKED_IN, BookingState.CHECKED_OUT));
    }

    @Override
    public Room allocateAvailableRoom(RoomCategory roomCategory, LocalDate checkInDate, LocalDate checkOutDate) {
        return findAvailableRoom(roomCategory.getHotel().getHotelId(), roomCategory.getRoomCategoryId(), checkInDate, checkOutDate);
    }

    public Room findAvailableRoom(Long hotelId, Long roomCategoryId, LocalDate checkInDate, LocalDate checkOutDate) {
        List<Room> rooms = roomRepository.findByHotelHotelId(hotelId);
        for (Room room : rooms) {
            if (!room.getRoomCategory().getRoomCategoryId().equals(roomCategoryId)) {
                continue;
            }
            if (room.getBookingStatus() == BookingStatus.UNDER_MAINTENANCE || room.getBookingStatus() == BookingStatus.OUT_OF_SERVICE) {
                continue;
            }
            if (hasOverlappingBlockingBooking(room, checkInDate, checkOutDate)) {
                continue;
            }
            return room;
        }
        return null;
    }

    @Override
    @Loggable
    public Booking cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getBookingState() == BookingState.CHECKED_IN
                || booking.getBookingState() == BookingState.CHECKED_OUT
                || booking.getBookingState() == BookingState.COMPLETED
                || booking.getBookingState() == BookingState.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking cannot be cancelled.");
        }

        booking.setBookingState(BookingState.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    @Override
    public Booking getBookingById(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
    }

    @Override
    @Transactional
    public List<Booking> getBookingsByStateAndOwner(Long ownerId, BookingState bookingState) {
        requireHotelOwner(ownerId);
        return bookingsForOwner(ownerId).stream()
                .filter(booking -> booking.getBookingState() == bookingState)
                .toList();
    }

    @Override
    @Transactional
    public List<Booking> getBookingsByOwner(Long ownerId) {
        requireHotelOwner(ownerId);
        return bookingsForOwner(ownerId);
    }


    private List<Booking> bookingsForOwner(Long ownerId) {
        normalizeLegacyBookingStates();
        return bookingRepository.findAll().stream()
                .filter(booking -> booking.getHotel() != null && booking.getHotel().getOwner() != null)
                .filter(booking -> booking.getHotel().getOwner().getUserId().equals(ownerId))
                .sorted(java.util.Comparator.comparing(Booking::getBookingTimestamp).reversed())
                .toList();
    }

    @Transactional
    private void normalizeLegacyBookingStates() {
        try {
            entityManager.createNativeQuery("ALTER TABLE bookings MODIFY COLUMN booking_state VARCHAR(30) NOT NULL")
                    .executeUpdate();
        } catch (Exception ignored) {
            // Ignore schema-alter failures and continue with data normalization.
        }

        entityManager.createNativeQuery("""
                UPDATE bookings
                SET booking_state = CASE
                    WHEN UPPER(TRIM(COALESCE(booking_state, ''))) IN ('CONFIRMED', 'CONFIRM') THEN 'PAYMENT_PENDING'
                    WHEN UPPER(TRIM(COALESCE(booking_state, ''))) = 'OWNER_CONFIRMED' THEN 'PAYMENT_PENDING'
                    WHEN UPPER(TRIM(COALESCE(booking_state, ''))) = 'PENDING' THEN 'PAYMENT_PENDING'
                    WHEN UPPER(TRIM(COALESCE(booking_state, ''))) = 'PAYMENT_PENDING' THEN 'PAYMENT_PENDING'
                    WHEN UPPER(TRIM(COALESCE(booking_state, ''))) = 'PAID' THEN 'CONFIRMED'
                    WHEN UPPER(TRIM(COALESCE(booking_state, ''))) = 'CHECKED_IN' THEN 'CHECKED_IN'
                    WHEN UPPER(TRIM(COALESCE(booking_state, ''))) = 'CHECKED_OUT' THEN 'CHECKED_OUT'
                    WHEN UPPER(TRIM(COALESCE(booking_state, ''))) = 'COMPLETED' THEN 'COMPLETED'
                    WHEN UPPER(TRIM(COALESCE(booking_state, ''))) = 'REJECTED' THEN 'CANCELLED'
                    WHEN UPPER(TRIM(COALESCE(booking_state, ''))) = 'CANCELLED' THEN 'CANCELLED'
                    WHEN UPPER(TRIM(COALESCE(booking_state, ''))) = '' OR booking_state IS NULL THEN 'PAYMENT_PENDING'
                    ELSE 'PAYMENT_PENDING'
                END
                """).executeUpdate();
        entityManager.flush();
        entityManager.clear();
    }

    private void requireHotelOwner(Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel owner not found."));
        if (owner.getRole() != Role.HOTEL_OWNER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Hotel owner access is required.");
        }
    }

    private boolean hasOverlappingBlockingBooking(Room room, LocalDate requestedCheckIn, LocalDate requestedCheckOut) {
        List<Booking> bookings = bookingRepository.findConflictingBookings(room, requestedCheckIn, requestedCheckOut,
                List.of(BookingState.CONFIRMED, BookingState.CHECKED_IN, BookingState.CHECKED_OUT));
        return !bookings.isEmpty();
    }
}
