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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
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


    @Transactional
    public PaymentResponse createPayment(PaymentRequest request) {

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

        // 5. Fetch accounts with database locks
        Account senderAccount =
                accountRepository.findByUserIdForUpdate(sender)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Sender account not found"
                        ));

        Account receiverAccount =
                accountRepository.findByUserIdForUpdate(receiver)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Receiver account not found"
                        ));

        // 6. Check sufficient balance
        if (senderAccount.getBalance()
                .compareTo(request.amount) < 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Insufficient account balance"
            );
        }

        // 7. Debit sender
        senderAccount.setBalance(
                senderAccount.getBalance().subtract(request.amount)
        );

        // 8. Credit receiver
        receiverAccount.setBalance(
                receiverAccount.getBalance().add(request.amount)
        );

        // 9. Save updated accounts
        accountRepository.save(senderAccount);
        accountRepository.save(receiverAccount);

        // 10. Create payment record
        Payment newPayment = new Payment();

            // Set payment fields according to your entity
            newPayment.setSenderAccount(senderAccount);
            newPayment.setReceiverAccount(receiverAccount);
            newPayment.setAmount(request.amount);
            newPayment.setCurrency(request.currency);
            newPayment.setStatus(PaymentStatus.SUCCESS);

        Payment savedPayment = paymentRepository.save(newPayment);

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
