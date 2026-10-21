package com.payflow.services;

import com.payflow.dto.PaymentRequest;
import com.payflow.entities.Payment;
import com.payflow.repository.PaymentRepository;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    private PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository){
        this.paymentRepository = paymentRepository;
    }

    public Payment createPayment(PaymentRequest payment , String key){

            Payment p = new Payment();

            p.setCustomerId(payment.customerId);
            p.setCurrency(payment.currency);
            p.setAmount(payment.amount);



        return paymentRepository.save(p);
    }

    public Payment getPayment(String id){

        Payment p = paymentRepository.findById(id).orElse(null);

        return p;

    }

}
