package com.yatrika.servicesImpl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import com.yatrika.dto.PaymentRequest;
import com.yatrika.dto.PaymentResponse;
import com.yatrika.entity.Booking;
import com.yatrika.entity.Payment;
import com.yatrika.entity.User;
import com.yatrika.enums.BookingState;
import com.yatrika.enums.PaymentStatus;
import com.yatrika.enums.Role;
import com.yatrika.repository.BookingRepository;
import com.yatrika.repository.PaymentRepository;
import com.yatrika.repository.UserRepository;

class PaymentServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    private PaymentServiceImpl paymentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        paymentService = new PaymentServiceImpl(paymentRepository, bookingRepository, userRepository);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createPayment_rejectsPaymentForAnotherUsersBooking() {
        User customer = User.builder().userId(1L).email("customer@example.com").role(Role.CUSTOMER).build();
        User otherUser = User.builder().userId(2L).email("other@example.com").role(Role.CUSTOMER).build();
        Booking booking = Booking.builder()
                .bookingId(10L)
                .user(customer)
                .bookingState(BookingState.PAYMENT_PENDING)
                .totalPrice(100.0)
                .build();

        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));
        when(userRepository.findByEmail("other@example.com")).thenReturn(Optional.of(otherUser));
        when(paymentRepository.findByBookingBookingId(10L)).thenReturn(List.of());

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("other@example.com", "password",
                        List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))));

        PaymentRequest request = new PaymentRequest();
        request.setBookingId(10L);
        request.setAmount(100.0);
        request.setPaymentMethod("CARD");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> paymentService.createPayment(10L, request));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void createPayment_marksBookingPaidAndGeneratesReference() {
        User customer = User.builder().userId(1L).email("customer@example.com").role(Role.CUSTOMER).build();
        Booking booking = Booking.builder()
                .bookingId(11L)
                .user(customer)
                .bookingState(BookingState.PAYMENT_PENDING)
                .totalPrice(250.0)
                .build();

        when(bookingRepository.findById(11L)).thenReturn(Optional.of(booking));
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customer));
        when(paymentRepository.findByBookingBookingId(11L)).thenReturn(List.of());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment payment = invocation.getArgument(0);
            payment.setPaymentId(99L);
            return payment;
        });
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("customer@example.com", "password",
                        List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))));

        PaymentRequest request = new PaymentRequest();
        request.setBookingId(11L);
        request.setAmount(250.0);
        request.setPaymentMethod("UPI");

        PaymentResponse response = paymentService.createPayment(11L, request);

        assertEquals(PaymentStatus.SUCCESS, response.getPaymentStatus());
        assertEquals(BookingState.CONFIRMED, booking.getBookingState());
        assertTrue(response.getTransactionReference().startsWith("PAY-"));
        assertEquals(BookingState.CONFIRMED.name(), response.getBookingStatus());
        verify(bookingRepository).save(booking);
    }

    @Test
    void createPayment_keepsBookingPendingWhenPaymentFails() {
        User customer = User.builder().userId(1L).email("customer@example.com").role(Role.CUSTOMER).build();
        Booking booking = Booking.builder()
                .bookingId(12L)
                .user(customer)
                .bookingState(BookingState.PAYMENT_PENDING)
                .totalPrice(120.0)
                .build();

        when(bookingRepository.findById(12L)).thenReturn(Optional.of(booking));
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customer));
        when(paymentRepository.findByBookingBookingId(12L)).thenReturn(List.of());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment payment = invocation.getArgument(0);
            payment.setPaymentId(100L);
            return payment;
        });

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("customer@example.com", "password",
                        List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))));

        PaymentRequest request = new PaymentRequest();
        request.setBookingId(12L);
        request.setAmount(120.0);
        request.setPaymentMethod("CARD");

        PaymentResponse response = paymentService.createPayment(12L, request);

        assertEquals(PaymentStatus.FAILED, response.getPaymentStatus());
        assertEquals(BookingState.PAYMENT_PENDING, booking.getBookingState());
        assertEquals(12L, response.getBookingId());
        assertEquals(BookingState.PAYMENT_PENDING.name(), response.getBookingStatus());
        verify(bookingRepository).findById(12L);
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void createPayment_rejectsNonPendingBookings() {
        User customer = User.builder().userId(1L).email("customer@example.com").role(Role.CUSTOMER).build();
        Booking booking = Booking.builder()
                .bookingId(13L)
                .user(customer)
                .bookingState(BookingState.CONFIRMED)
                .totalPrice(150.0)
                .build();

        when(bookingRepository.findById(13L)).thenReturn(Optional.of(booking));
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customer));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("customer@example.com", "password",
                        List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))));

        PaymentRequest request = new PaymentRequest();
        request.setBookingId(13L);
        request.setAmount(150.0);
        request.setPaymentMethod("CARD");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> paymentService.createPayment(13L, request));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(paymentRepository, never()).findByBookingBookingId(anyLong());
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    @Test
    void createPayment_rejectsDuplicateSuccessfulPayment() {
        User customer = User.builder().userId(1L).email("customer@example.com").role(Role.CUSTOMER).build();
        Booking booking = Booking.builder()
                .bookingId(14L)
                .user(customer)
                .bookingState(BookingState.PAYMENT_PENDING)
                .totalPrice(150.0)
                .build();

        Payment existingPayment = Payment.builder()
                .paymentId(101L)
                .booking(booking)
                .amount(150.0)
                .paymentStatus(PaymentStatus.SUCCESS)
                .build();

        when(bookingRepository.findById(14L)).thenReturn(Optional.of(booking));
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customer));
        when(paymentRepository.findByBookingBookingId(14L)).thenReturn(List.of(existingPayment));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("customer@example.com", "password",
                        List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))));

        PaymentRequest request = new PaymentRequest();
        request.setBookingId(13L);
        request.setAmount(150.0);
        request.setPaymentMethod("CARD");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> paymentService.createPayment(13L, request));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(paymentRepository, never()).save(any(Payment.class));
    }
}
