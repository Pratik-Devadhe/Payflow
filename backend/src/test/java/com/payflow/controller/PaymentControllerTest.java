package com.payflow.controller;

import com.payflow.dto.PaymentRequest;
import com.payflow.dto.PaymentResponse;
import com.payflow.enums.PaymentStatus;
import com.payflow.services.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentControllerTest {

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private PaymentController paymentController;

    private PaymentRequest validRequest;
    private PaymentResponse mockResponse;
    private final String headerKey = "hdr-uuid-111";
    private final String bodyKey = "body-uuid-222";

    @BeforeEach
    void setUp() {
        validRequest = new PaymentRequest();
        validRequest.senderId = UUID.randomUUID();
        validRequest.receiverId = UUID.randomUUID();
        validRequest.amount = new BigDecimal("100.00");
        validRequest.currency = "INR";

        mockResponse = new PaymentResponse(
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID(),
                new BigDecimal("100.00"),
                "INR",
                PaymentStatus.PENDING,
                "INTERNAL"
        );
    }

    @Test
    void testCreatePayment_PrefersHeaderKey() {
        validRequest.idempotency_key = bodyKey;

        when(paymentService.createPayment(validRequest, headerKey)).thenReturn(mockResponse);

        ResponseEntity<PaymentResponse> response = paymentController.createPayment(headerKey, validRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(paymentService, times(1)).createPayment(validRequest, headerKey);
    }

    @Test
    void testCreatePayment_FallsBackToBodyKey_WhenHeaderMissing() {
        validRequest.idempotency_key = bodyKey;

        when(paymentService.createPayment(validRequest, bodyKey)).thenReturn(mockResponse);

        ResponseEntity<PaymentResponse> response = paymentController.createPayment(null, validRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(paymentService, times(1)).createPayment(validRequest, bodyKey);
    }

    @Test
    void testCreatePayment_ThrowsBadRequest_WhenKeyMissingEverywhere() {
        validRequest.idempotency_key = null;
        validRequest.idempotencyKey = null;

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                paymentController.createPayment(null, validRequest)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(paymentService, never()).createPayment(any(), any());
    }
}
