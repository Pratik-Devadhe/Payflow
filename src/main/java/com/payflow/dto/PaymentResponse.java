package com.payflow.dto;

import com.payflow.enums.PaymentStatus;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentResponse(

        UUID id,

        UUID senderAccountId,

        UUID receiverAccountId,

        BigDecimal amount,

        String currency,

        PaymentStatus status,

        String provider

) {}