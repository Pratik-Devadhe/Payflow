package com.payflow.dto;

import com.payflow.entities.Account;
import com.payflow.enums.PaymentStatus;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentResponse(

        UUID id,
        Account senderAccount,
        Account receiverAccount,
        BigDecimal amount,
        String currency,
        PaymentStatus status,
        String provider
) {}
