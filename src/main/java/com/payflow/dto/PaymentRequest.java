package com.payflow.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.util.UUID;


//used for validation of the incoming request

public class PaymentRequest {

    @NotBlank
    public UUID senderId;

    @NotBlank
    public UUID reciverId;


    @NotNull
    @DecimalMin(value = "0.02")
    public BigDecimal amount;

    @NotNull
    @Pattern(regexp = "INR|USA|EUR")
    public String currency;

}


