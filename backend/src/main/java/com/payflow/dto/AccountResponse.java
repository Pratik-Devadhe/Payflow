package com.payflow.dto;

import com.payflow.enums.AccountStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record AccountResponse(
        UUID id,
        String accountNumber,
        BigDecimal balance,
        String currency,
        AccountStatus status,
        LocalDateTime createdAt
) {}