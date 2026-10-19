package com.payflow.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public class PaymentRequest {

    @NotBlank
    String customerId;
    @NotNull
    @DecimalMin(value = "0.01")
    BigDecimal amount;

    @NotBlank
}
