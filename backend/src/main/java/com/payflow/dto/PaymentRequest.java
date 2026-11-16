package com.payflow.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.util.UUID;


//used for validation of the incoming request

public class PaymentRequest {

    @NotNull
    public UUID senderId;

    @NotNull
    public UUID receiverId;

    // Optional in body if supplied via 'Idempotency-Key' HTTP header
    public String idempotency_key;
    public String idempotencyKey;

    public String getIdempotencyKey() {
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            return idempotencyKey.trim();
        }
        if (idempotency_key != null && !idempotency_key.isBlank()) {
            return idempotency_key.trim();
        }
        return null;
    }

    @NotNull
    @DecimalMin(value = "0.02")
    public BigDecimal amount;

    @NotNull
    @Pattern(regexp = "INR|USA|EUR")
    public String currency;

}


