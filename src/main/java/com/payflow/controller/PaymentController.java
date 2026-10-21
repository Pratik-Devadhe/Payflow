package com.payflow.controller;


import com.payflow.dto.PaymentRequest;
import com.payflow.entities.Payment;
import com.payflow.services.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments/")
//@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private PaymentService paymentService;

    public PaymentController(PaymentService paymentService){
        this.paymentService = paymentService;
    }

    @PostMapping("/")
    @ResponseStatus(HttpStatus.CREATED)
    public Payment createPayment(@Valid @RequestBody PaymentRequest payment,
                                 @RequestHeader("Idempotency-Key") String key){

            return paymentService.createPayment(payment , key);
    }

    @GetMapping("{id}")
    public Payment getPayment(@PathVariable String id){
        return paymentService.getPayment(id);
    }

//    @GetMapping("/")
//    public ResponseEntity<?> getAllPayments(){
//        return null;
//    }



}
