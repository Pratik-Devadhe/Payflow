package com.payflow.services;

import com.payflow.entities.Account;
import com.payflow.entities.Payment;
import com.payflow.enums.PaymentStatus;
import com.payflow.repository.AccountRepository;
import com.payflow.repository.PaymentRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentProcessingService {

    private final PaymentRepository paymentRepository;
    private final AccountRepository accountRepository;

    @Transactional
    public void processPayment(UUID paymentId) {

        // 1. Fetch payment with database lock
        Payment payment = paymentRepository
                .findByIdForUpdate(paymentId)
                .orElseThrow();

        // 2. Process only pending payments
        if (payment.getStatus() != PaymentStatus.PENDING) {
            return;
        }

        payment.setStatus(PaymentStatus.PROCESSING);

        // 3. Get account IDs
        UUID senderId = payment.getSenderAccount().getId();
        UUID receiverId = payment.getReceiverAccount().getId();

        // 4. Lock accounts in consistent ID order
        List<UUID> accountIds = List.of(senderId, receiverId)
                .stream()
                .sorted()
                .toList();

        Account first = accountRepository
                .findByIdForUpdate(accountIds.get(0))
                .orElseThrow();

        Account second = accountRepository
                .findByIdForUpdate(accountIds.get(1))
                .orElseThrow();

        Account sender = first.getId().equals(senderId) ? first : second;
        Account receiver = first.getId().equals(receiverId) ? first : second;

        // 5. Check sufficient balance
        BigDecimal amount = payment.getAmount();

        if (sender.getBalance().compareTo(amount) < 0) {

            payment.setStatus(PaymentStatus.FAILED);

            paymentRepository.save(payment);

            return;
        }

        // 6. Debit sender
        sender.setBalance(
                sender.getBalance().subtract(amount)
        );

        // 7. Credit receiver
        receiver.setBalance(
                receiver.getBalance().add(amount)
        );

        // 8. Mark payment successful
        payment.setStatus(PaymentStatus.SUCCESS);

        // 9. Save changes
        accountRepository.save(sender);
        accountRepository.save(receiver);
        paymentRepository.save(payment);
    }
}