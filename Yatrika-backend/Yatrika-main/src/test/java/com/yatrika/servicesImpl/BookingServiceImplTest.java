package com.yatrika.servicesImpl;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.Method;
import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.yatrika.entity.Room;
import com.yatrika.enums.BookingState;
import com.yatrika.repository.AddOnRepository;
import com.yatrika.repository.BookingRepository;
import com.yatrika.repository.HotelRepository;
import com.yatrika.repository.RoomCategoryRepository;
import com.yatrika.repository.RoomRepository;
import com.yatrika.repository.UserRepository;

class BookingServiceImplTest {

    @Test
    void normalizeLegacyBookingStatesRunsMigrationAndUpdateQueries() throws Exception {
        BookingRepository bookingRepository = mock(BookingRepository.class);
        RoomRepository roomRepository = mock(RoomRepository.class);
        RoomCategoryRepository roomCategoryRepository = mock(RoomCategoryRepository.class);
        HotelRepository hotelRepository = mock(HotelRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        AddOnRepository addOnRepository = mock(AddOnRepository.class);
        com.yatrika.repository.HotelAddOnRepository hotelAddOnRepository = mock(com.yatrika.repository.HotelAddOnRepository.class);
        EntityManager entityManager = mock(EntityManager.class);
        Query alterQuery = mock(Query.class);
        Query updateQuery = mock(Query.class);

        BookingServiceImpl service = new BookingServiceImpl(
                bookingRepository,
                roomRepository,
                roomCategoryRepository,
                hotelRepository,
                userRepository,
                addOnRepository,
                hotelAddOnRepository);
        ReflectionTestUtils.setField(service, "entityManager", entityManager);

        when(entityManager.createNativeQuery(anyString())).thenReturn(alterQuery, updateQuery);
        when(alterQuery.executeUpdate()).thenReturn(0);
        when(updateQuery.executeUpdate()).thenReturn(1);

        Method method = BookingServiceImpl.class.getDeclaredMethod("normalizeLegacyBookingStates");
        method.setAccessible(true);
        method.invoke(service);

        verify(entityManager).createNativeQuery(contains("ALTER TABLE bookings"));
        verify(entityManager).createNativeQuery(contains("UPDATE bookings"));
        verify(entityManager).flush();
        verify(entityManager).clear();
    }

    @Test
    void findConflictingBookingsUsesConfirmedAndCheckedStatesOnly() {
        BookingRepository bookingRepository = mock(BookingRepository.class);
        RoomRepository roomRepository = mock(RoomRepository.class);
        RoomCategoryRepository roomCategoryRepository = mock(RoomCategoryRepository.class);
        HotelRepository hotelRepository = mock(HotelRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        AddOnRepository addOnRepository = mock(AddOnRepository.class);
        com.yatrika.repository.HotelAddOnRepository hotelAddOnRepository = mock(com.yatrika.repository.HotelAddOnRepository.class);

        BookingServiceImpl service = new BookingServiceImpl(
                bookingRepository,
                roomRepository,
                roomCategoryRepository,
                hotelRepository,
                userRepository,
                addOnRepository,
                hotelAddOnRepository);

        Room room = mock(Room.class);
        when(bookingRepository.findConflictingBookings(
                argThat(r -> r == room),
                argThat(date -> true),
                argThat(date -> true),
                argThat(states -> states.contains(BookingState.CONFIRMED)
                        && states.contains(BookingState.CHECKED_IN)
                        && states.contains(BookingState.CHECKED_OUT)
                        && states.size() == 3)))
                .thenReturn(List.of());

        service.findConflictingBookings(room, LocalDate.now(), LocalDate.now().plusDays(1));

        verify(bookingRepository).findConflictingBookings(
                argThat(r -> r == room),
                argThat(date -> true),
                argThat(date -> true),
                argThat(states -> states.contains(BookingState.CONFIRMED)
                        && states.contains(BookingState.CHECKED_IN)
                        && states.contains(BookingState.CHECKED_OUT)
                        && states.size() == 3));
    }
}
