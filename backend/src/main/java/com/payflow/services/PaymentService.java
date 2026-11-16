package com.payflow.services;

import com.payflow.dto.AccountResponse;
import com.payflow.dto.PaymentRequest;
import com.payflow.dto.PaymentResponse;
import com.payflow.entities.Account;
import com.payflow.entities.Payment;
import com.payflow.entities.User;
import com.payflow.enums.PaymentStatus;
import com.payflow.repository.AccountRepository;
import com.payflow.repository.PaymentRepository;
import com.payflow.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static java.util.stream.Collectors.toList;

@Service
public class PaymentService {

    private PaymentRepository paymentRepository;
    private UserRepository userRepository;
    private AccountRepository accountRepository;

    public PaymentService(PaymentRepository paymentRepository, UserRepository userRepository , AccountRepository accountRepository){
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
    }

//    1. create payment;

//    dive into 2 parts i: payment creation  ii: transaction completion;


    @Transactional
    public PaymentResponse createPayment(PaymentRequest request, String idempotencyKey) {

        Optional<Payment> existingPayment =
                paymentRepository.findByIdempotencyKey(idempotencyKey);

        if (existingPayment.isPresent()) {
            Payment existing = existingPayment.get();

            // Semantic check: verify all request parameters match the original payment
            boolean senderMatches = existing.getSenderAccount() != null
                    && existing.getSenderAccount().getUser() != null
                    && existing.getSenderAccount().getUser().getId().equals(request.senderId);

            boolean receiverMatches = existing.getReceiverAccount() != null
                    && existing.getReceiverAccount().getUser() != null
                    && existing.getReceiverAccount().getUser().getId().equals(request.receiverId);

            boolean amountMatches = existing.getAmount() != null
                    && request.amount != null
                    && existing.getAmount().compareTo(request.amount) == 0;

            boolean currencyMatches = existing.getCurrency() != null
                    && existing.getCurrency().equalsIgnoreCase(request.currency);

            if (!senderMatches || !receiverMatches || !amountMatches || !currencyMatches) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Idempotency key has already been used with different payment parameters"
                );
            }

            return convertToResponse(existing);
        }

        // 1. Validate amount
        if (request.amount == null ||
                request.amount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment amount must be greater than zero"
            );
        }

        // 2. Validate sender
        User sender = userRepository.findById(request.senderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Sender is not a valid user"
                ));

        // 3. Validate receiver
        User receiver = userRepository.findById(request.receiverId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Receiver is not a valid user"
                ));

        // 4. Prevent self-payment
        if (sender.getId().equals(receiver.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Sender and receiver cannot be the same"
            );
        }

        // 5. Fetch accounts
        Account senderAccount =
                accountRepository.findByUser(sender)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Sender account not found"
                        ));

        Account receiverAccount =
                accountRepository.findByUser(receiver)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Receiver account not found"
                        ));

        // 6. Create payment record
        Payment newPayment = new Payment();

        newPayment.setSenderAccount(senderAccount);
        newPayment.setReceiverAccount(receiverAccount);
        newPayment.setAmount(request.amount);
        newPayment.setCurrency(request.currency);
        newPayment.setIdempotencyKey(idempotencyKey);
        newPayment.setStatus(PaymentStatus.PENDING);

        Payment savedPayment;
        try {
            savedPayment = paymentRepository.saveAndFlush(newPayment);
        } catch (DataIntegrityViolationException e) {
            // Concurrent race condition: another transaction committed with this idempotency key
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A payment request with this idempotency key is already in progress or has been processed"
            );
        }

        return new PaymentResponse(
                savedPayment.getId(),
                savedPayment.getSenderAccount().getId(),
                savedPayment.getReceiverAccount().getId(),
                savedPayment.getAmount(),
                savedPayment.getCurrency(),
                savedPayment.getStatus(),
                savedPayment.getProvider()
        );
    }





//    2. get all payments

    public List<PaymentResponse> getAllPayments() {

        return paymentRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

//    3. getpaymentById

    public PaymentResponse getPayment(UUID id) {

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Payment not found: " + id)
                );

        return convertToResponse(payment);
    }



    private PaymentResponse convertToResponse(Payment payment){
        return new PaymentResponse(
                payment.getId(),
                payment.getSenderAccount().getId(),
                payment.getReceiverAccount().getId(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getStatus(),
                payment.getProvider()
        );
    }

}
