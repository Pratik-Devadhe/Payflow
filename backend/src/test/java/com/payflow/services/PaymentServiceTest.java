package com.payflow.services;

import com.payflow.dto.PaymentRequest;
import com.payflow.dto.PaymentResponse;
import com.payflow.entities.Account;
import com.payflow.entities.Payment;
import com.payflow.entities.User;
import com.payflow.enums.AccountStatus;
import com.payflow.enums.PaymentStatus;
import com.payflow.repository.AccountRepository;
import com.payflow.repository.PaymentRepository;
import com.payflow.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private PaymentService paymentService;

    private User sender;
    private User receiver;
    private Account senderAccount;
    private Account receiverAccount;
    private PaymentRequest validRequest;
    private final String idempotencyKey = "uuid-key-12345";

    @BeforeEach
    void setUp() {
        sender = new User();
        sender.setId(UUID.randomUUID());
        sender.setName("Alice");

        receiver = new User();
        receiver.setId(UUID.randomUUID());
        receiver.setName("Bob");

        senderAccount = new Account();
        senderAccount.setId(UUID.randomUUID());
        senderAccount.setUser(sender);
        senderAccount.setBalance(new BigDecimal("1000.00"));
        senderAccount.setStatus(AccountStatus.ACTIVE);

        receiverAccount = new Account();
        receiverAccount.setId(UUID.randomUUID());
        receiverAccount.setUser(receiver);
        receiverAccount.setBalance(new BigDecimal("500.00"));
        receiverAccount.setStatus(AccountStatus.ACTIVE);

        validRequest = new PaymentRequest();
        validRequest.senderId = sender.getId();
        validRequest.receiverId = receiver.getId();
        validRequest.amount = new BigDecimal("250.00");
        validRequest.currency = "INR";
        validRequest.idempotencyKey = idempotencyKey;
    }

    @Test
    void testCreatePayment_Success() {
        when(paymentRepository.findByIdempotencyKey(idempotencyKey)).thenReturn(Optional.empty());
        when(userRepository.findById(sender.getId())).thenReturn(Optional.of(sender));
        when(userRepository.findById(receiver.getId())).thenReturn(Optional.of(receiver));
        when(accountRepository.findByUser(sender)).thenReturn(Optional.of(senderAccount));
        when(accountRepository.findByUser(receiver)).thenReturn(Optional.of(receiverAccount));

        Payment savedPayment = new Payment();
        savedPayment.setId(UUID.randomUUID());
        savedPayment.setSenderAccount(senderAccount);
        savedPayment.setReceiverAccount(receiverAccount);
        savedPayment.setAmount(validRequest.amount);
        savedPayment.setCurrency(validRequest.currency);
        savedPayment.setIdempotencyKey(idempotencyKey);
        savedPayment.setStatus(PaymentStatus.PENDING);
        savedPayment.setProvider("INTERNAL");

        when(paymentRepository.saveAndFlush(any(Payment.class))).thenReturn(savedPayment);

        PaymentResponse response = paymentService.createPayment(validRequest, idempotencyKey);

        assertNotNull(response);
        assertEquals(savedPayment.getId(), response.id());
        assertEquals(validRequest.amount, response.amount());
        assertEquals(PaymentStatus.PENDING, response.status());
        verify(paymentRepository, times(1)).saveAndFlush(any(Payment.class));
    }

    @Test
    void testCreatePayment_IdempotentDuplicate_ReturnsExisting() {
        Payment existingPayment = new Payment();
        existingPayment.setId(UUID.randomUUID());
        existingPayment.setSenderAccount(senderAccount);
        existingPayment.setReceiverAccount(receiverAccount);
        existingPayment.setAmount(validRequest.amount);
        existingPayment.setCurrency(validRequest.currency);
        existingPayment.setIdempotencyKey(idempotencyKey);
        existingPayment.setStatus(PaymentStatus.PENDING);
        existingPayment.setProvider("INTERNAL");

        when(paymentRepository.findByIdempotencyKey(idempotencyKey)).thenReturn(Optional.of(existingPayment));

        PaymentResponse response = paymentService.createPayment(validRequest, idempotencyKey);

        assertNotNull(response);
        assertEquals(existingPayment.getId(), response.id());
        // Verify no new payment is saved
        verify(paymentRepository, never()).saveAndFlush(any());
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void testCreatePayment_IdempotentDuplicate_MismatchedAmount_ThrowsConflict() {
        Payment existingPayment = new Payment();
        existingPayment.setId(UUID.randomUUID());
        existingPayment.setSenderAccount(senderAccount);
        existingPayment.setReceiverAccount(receiverAccount);
        existingPayment.setAmount(new BigDecimal("999.00")); // Different amount!
        existingPayment.setCurrency(validRequest.currency);
        existingPayment.setIdempotencyKey(idempotencyKey);

        when(paymentRepository.findByIdempotencyKey(idempotencyKey)).thenReturn(Optional.of(existingPayment));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                paymentService.createPayment(validRequest, idempotencyKey)
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertTrue(exception.getReason().contains("different payment parameters"));
    }

    @Test
    void testCreatePayment_IdempotentDuplicate_MismatchedReceiver_ThrowsConflict() {
        User otherReceiver = new User();
        otherReceiver.setId(UUID.randomUUID());

        Account otherAccount = new Account();
        otherAccount.setId(UUID.randomUUID());
        otherAccount.setUser(otherReceiver);

        Payment existingPayment = new Payment();
        existingPayment.setId(UUID.randomUUID());
        existingPayment.setSenderAccount(senderAccount);
        existingPayment.setReceiverAccount(otherAccount); // Different receiver!
        existingPayment.setAmount(validRequest.amount);
        existingPayment.setCurrency(validRequest.currency);
        existingPayment.setIdempotencyKey(idempotencyKey);

        when(paymentRepository.findByIdempotencyKey(idempotencyKey)).thenReturn(Optional.of(existingPayment));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                paymentService.createPayment(validRequest, idempotencyKey)
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertTrue(exception.getReason().contains("different payment parameters"));
    }

    @Test
    void testCreatePayment_ConcurrentRaceCondition_ThrowsConflict() {
        when(paymentRepository.findByIdempotencyKey(idempotencyKey)).thenReturn(Optional.empty());
        when(userRepository.findById(sender.getId())).thenReturn(Optional.of(sender));
        when(userRepository.findById(receiver.getId())).thenReturn(Optional.of(receiver));
        when(accountRepository.findByUser(sender)).thenReturn(Optional.of(senderAccount));
        when(accountRepository.findByUser(receiver)).thenReturn(Optional.of(receiverAccount));

        // Simulate unique constraint violation when saving concurrently
        when(paymentRepository.saveAndFlush(any(Payment.class)))
                .thenThrow(new DataIntegrityViolationException("duplicate key value violates unique constraint"));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                paymentService.createPayment(validRequest, idempotencyKey)
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertTrue(exception.getReason().contains("already in progress"));
    }

    @Test
    void testCreatePayment_SelfPayment_ThrowsBadRequest() {
        when(paymentRepository.findByIdempotencyKey(idempotencyKey)).thenReturn(Optional.empty());
        when(userRepository.findById(sender.getId())).thenReturn(Optional.of(sender));

        PaymentRequest selfRequest = new PaymentRequest();
        selfRequest.senderId = sender.getId();
        selfRequest.receiverId = sender.getId(); // Self payment!
        selfRequest.amount = new BigDecimal("100.00");
        selfRequest.currency = "INR";

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                paymentService.createPayment(selfRequest, idempotencyKey)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }
}
