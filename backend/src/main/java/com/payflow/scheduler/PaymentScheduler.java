package com.payflow.scheduler;

import com.payflow.entities.Payment;
import com.payflow.enums.PaymentStatus;
import com.payflow.repository.PaymentRepository;
import com.payflow.services.PaymentProcessingService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentScheduler {

    private final PaymentRepository paymentRepository;
    private final PaymentProcessingService paymentProcessingService;

    @Scheduled(fixedDelayString = "${payflow.payment-worker.delay:5000}")
    public void processPendingPayments() {

        List<Payment> pendingPayments =
                paymentRepository.findTop50ByStatusOrderByCreatedAtAsc(
                        PaymentStatus.PENDING
                );

        for (Payment payment : pendingPayments) {

            try {
                paymentProcessingService.processPayment(payment.getId());

            } catch (Exception e) {
                log.error(
                        "Failed to process payment: {}",
                        payment.getId(),
                        e
                );
            }
        }
    }
}