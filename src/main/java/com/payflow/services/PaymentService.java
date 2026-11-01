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
    public PaymentResponse createPayment(PaymentRequest payment){

//              Sender is Not Valid;
        if(!userRepository.existsById(payment.senderId)){
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Sender is not a valid user"
            );
        }

//        Receiver is not valid user

        if(!userRepository.existsById(payment.reciverId)){
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Receiver is not a valid user"
            );
        }

        User sender = userRepository.getById(payment.senderId);
        User receiver = userRepository.getById(payment.reciverId);

        AccountResponse senderAcc = accountRepository.findByUserId(sender);
        AccountResponse receiverAcc = accountRepository.findByUserId(receiver);

//        Not a Sufficient amount

        if(senderAcc.balance() < payment.amount){

        }

          return null;
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
                payment.getSenderAccount(),
                payment.getReceiverAccount(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getStatus(),
                payment.getProvider()
        );
    }

}
