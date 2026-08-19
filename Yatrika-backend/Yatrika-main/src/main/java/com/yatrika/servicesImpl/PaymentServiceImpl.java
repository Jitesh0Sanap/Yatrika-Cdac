package com.yatrika.servicesImpl;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.yatrika.config.Loggable;
import com.yatrika.dto.PaymentRequest;
import com.yatrika.dto.PaymentResponse;
import com.yatrika.entity.Booking;
import com.yatrika.entity.Payment;
import com.yatrika.entity.User;
import com.yatrika.enums.BookingState;
import com.yatrika.enums.PaymentStatus;
import com.yatrika.repository.BookingRepository;
import com.yatrika.repository.PaymentRepository;
import com.yatrika.repository.UserRepository;
import com.yatrika.servives.PaymentService;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import com.yatrika.dto.RazorpayOrderResponse;
import com.yatrika.dto.PaymentVerificationRequest;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Value("${razorpay.webhook.secret}")
    private String webhookSecret;

    public PaymentServiceImpl(PaymentRepository paymentRepository, BookingRepository bookingRepository,
                              UserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    @Loggable
    public PaymentResponse createPayment(Long bookingId, PaymentRequest request) {
        if (bookingId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking ID is required.");
        }

        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment request is required.");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required.");
        }

        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found."));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getUser() == null || !booking.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only pay for your own bookings.");
        }

        if (booking.getBookingState() != BookingState.PAYMENT_PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only payment-pending bookings can be paid.");
        }

        List<Payment> existingPayments = paymentRepository.findByBookingBookingId(booking.getBookingId());
        if (existingPayments.stream().anyMatch(payment -> payment.getPaymentStatus() == PaymentStatus.SUCCESS)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A successful payment has already been recorded for this booking.");
        }

        Double amount = request.getAmount() == null ? booking.getTotalPrice() : request.getAmount();
        if (amount == null || amount <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment amount must be greater than zero.");
        }

        PaymentStatus paymentStatus = amount >= booking.getTotalPrice() ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;

        String transactionReference = request.getTransactionReference() == null || request.getTransactionReference().isBlank()
                ? generateTransactionReference(booking)
                : request.getTransactionReference();

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(amount)
                .paymentMethod(request.getPaymentMethod())
                .transactionReference(transactionReference)
                .paymentStatus(paymentStatus)
                .paymentTime(LocalDateTime.now())
                .build();

        Payment saved = paymentRepository.save(payment);
        if (paymentStatus == PaymentStatus.SUCCESS) {
            booking.setBookingState(BookingState.CONFIRMED);
            booking.setConfirmedAt(LocalDateTime.now());
            bookingRepository.save(booking);
        }

        return new PaymentResponse(saved.getPaymentId(), booking.getBookingId(), saved.getAmount(), saved.getPaymentMethod(),
                saved.getTransactionReference(), saved.getPaymentStatus(), booking.getBookingState().name(), saved.getPaymentTime());
    }

    private String generateTransactionReference(Booking booking) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return "PAY-" + booking.getBookingId() + "-" + timestamp;
    }

    @Override
    @Transactional
    @Loggable
    public RazorpayOrderResponse createOrder(Long bookingId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required.");
        }

        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found."));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getUser() == null || !booking.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only pay for your own bookings.");
        }

        if (booking.getBookingState() != BookingState.PAYMENT_PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only payment-pending bookings can be paid.");
        }

        List<Payment> existingPayments = paymentRepository.findByBookingBookingId(booking.getBookingId());
        if (existingPayments.stream().anyMatch(payment -> payment.getPaymentStatus() == PaymentStatus.SUCCESS)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A successful payment has already been recorded for this booking.");
        }

        try {
            RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);
            JSONObject orderRequest = new JSONObject();
            int amountInPaise = (int) Math.round(booking.getTotalPrice() * 100);
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + booking.getBookingId());
            
            Order order = razorpay.orders.create(orderRequest);
            String orderId = order.get("id");

            Payment payment = Payment.builder()
                    .booking(booking)
                    .amount(booking.getTotalPrice())
                    .razorpayOrderId(orderId)
                    .paymentStatus(PaymentStatus.PENDING)
                    .build();
            paymentRepository.save(payment);

            return new RazorpayOrderResponse(orderId, amountInPaise, "INR", keyId);
        } catch (RazorpayException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error creating Razorpay order: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    @Loggable
    public PaymentResponse verifyPayment(Long bookingId, PaymentVerificationRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required.");
        }

        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found."));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getUser() == null || !booking.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only verify your own bookings.");
        }

        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", request.getRazorpayOrderId());
        options.put("razorpay_payment_id", request.getRazorpayPaymentId());
        options.put("razorpay_signature", request.getRazorpaySignature());

        boolean isValid = false;
        try {
            isValid = Utils.verifyPaymentSignature(options, keySecret);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Signature verification exception");
        }

        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment record not found"));

        if (!isValid) {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment signature verification failed");
        }

        String paymentMethod = "ONLINE";
        try {
            RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);
            com.razorpay.Payment rzpPayment = razorpay.payments.fetch(request.getRazorpayPaymentId());
            paymentMethod = rzpPayment.get("method");
        } catch (RazorpayException e) {
            // Ignore if fetch fails, default to ONLINE
        }

        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setPaymentTime(LocalDateTime.now());
        payment.setTransactionReference(request.getRazorpayPaymentId());
        payment.setPaymentMethod(paymentMethod);
        
        Payment saved = paymentRepository.save(payment);

        booking.setBookingState(BookingState.CONFIRMED);
        booking.setConfirmedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        return new PaymentResponse(saved.getPaymentId(), booking.getBookingId(), saved.getAmount(), saved.getPaymentMethod(),
                saved.getTransactionReference(), saved.getPaymentStatus(), booking.getBookingState().name(), saved.getPaymentTime());
    }

    @Override
    @Transactional
    @Loggable
    public void handleWebhook(String payload, String signature) {
        boolean isValid = false;
        try {
            isValid = Utils.verifyWebhookSignature(payload, signature, webhookSecret);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Webhook signature verification exception");
        }

        if (!isValid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Webhook signature verification failed");
        }

        try {
            JSONObject jsonPayload = new JSONObject(payload);
            String event = jsonPayload.getString("event");
            
            if ("payment.captured".equals(event)) {
                JSONObject paymentObj = jsonPayload.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
                String orderId = paymentObj.getString("order_id");
                String paymentId = paymentObj.getString("id");
                String method = paymentObj.getString("method");
                
                paymentRepository.findByRazorpayOrderId(orderId).ifPresent(payment -> {
                    if (payment.getPaymentStatus() != PaymentStatus.SUCCESS) {
                        payment.setPaymentStatus(PaymentStatus.SUCCESS);
                        payment.setRazorpayPaymentId(paymentId);
                        payment.setTransactionReference(paymentId);
                        payment.setPaymentMethod(method);
                        payment.setPaymentTime(LocalDateTime.now());
                        paymentRepository.save(payment);
                        
                        Booking booking = payment.getBooking();
                        if (booking.getBookingState() != BookingState.CONFIRMED) {
                            booking.setBookingState(BookingState.CONFIRMED);
                            booking.setConfirmedAt(LocalDateTime.now());
                            bookingRepository.save(booking);
                        }
                    }
                });
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error processing webhook payload");
        }
    }}
