package com.yatrika.config;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.yatrika.entity.User;
import com.yatrika.repository.AddOnRepository;
import com.yatrika.repository.BookingRepository;
import com.yatrika.repository.HotelAddOnRepository;
import com.yatrika.repository.HotelRepository;
import com.yatrika.repository.RoomCategoryRepository;
import com.yatrika.repository.RoomRepository;
import com.yatrika.repository.UserRepository;

class DataSeederTest {

    @Test
    void seedsUsersWhenHotelsAlreadyExistButUsersAreMissing() throws Exception {
        UserRepository userRepository = mock(UserRepository.class);
        HotelRepository hotelRepository = mock(HotelRepository.class);
        AddOnRepository addOnRepository = mock(AddOnRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);

        when(hotelRepository.count()).thenReturn(1L);
        when(addOnRepository.count()).thenReturn(0L);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(passwordEncoder.encode(anyString())).thenAnswer(invocation -> "encoded:" + invocation.getArgument(0));

        CommandLineRunner runner = new DataSeeder().seedData(
                userRepository,
                hotelRepository,
                mock(RoomCategoryRepository.class),
                mock(RoomRepository.class),
                addOnRepository,
                mock(HotelAddOnRepository.class),
                mock(BookingRepository.class),
                mock(com.yatrika.repository.ReviewRepository.class),
                passwordEncoder,
                mock(DataSeeder.DataCleaner.class),
                mock(DataSeeder.HotelAggregateUpdater.class));

        runner.run();

        verify(userRepository, atLeast(1)).save(any(User.class));
        verify(userRepository).save(argThat(user -> "admin@yatrika.com".equals(user.getEmail())));
    }
}
