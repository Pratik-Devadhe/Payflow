package com.payflow.dto;

import com.payflow.entities.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record AccountRequest(

        @NotNull(message = "User ID is required")
        UUID userId,

        @NotBlank(message = "Account number is required")
        String accountNumber,

        @NotNull(message = "Initial balance is required")
        BigDecimal balance

) {}
