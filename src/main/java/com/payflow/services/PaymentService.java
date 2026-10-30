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

    public Payment createPayment(PaymentRequest payment , String key){


          try{
              if(paymentRepository.findByIdempotencyKey(key).equals(false)){
                        throw new Exception("Payment Already Exits!!!!");
              }

              Payment p = new Payment();

              p.setCustomerId(payment.customerId);
              p.setCurrency(payment.currency);
              p.setAmount(payment.amount);
              p.setStatus(PaymentStatus.valueOf("SUCCESS"));
              p.setIdempotencyKey(key);

              return paymentRepository.save(p);
          }catch(Exception e){
              System.out.println(e);
          }

          return null;
    }

    public Payment getPayment(String id) {

        return paymentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Payment not found: " + id)
                );
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

}
