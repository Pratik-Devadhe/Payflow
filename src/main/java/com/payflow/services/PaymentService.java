package com.payflow.services;

import com.payflow.dto.PaymentRequest;
import com.payflow.entities.Payment;
import com.payflow.enums.PaymentStatus;
import com.payflow.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {

    private PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository){
        this.paymentRepository = paymentRepository;
    }

//    public Payment createPayment(PaymentRequest payment){
//
//          return null;
//    }

//    public Payment getPayment(String id) {
//
//        return paymentRepository.findById(id)
//                .orElseThrow(() ->
//                        new RuntimeException("Payment not found: " + id)
//                );
//    }

//    public List<Payment> getAllPayments() {
//        return paymentRepository.findAll();
//    }

}
