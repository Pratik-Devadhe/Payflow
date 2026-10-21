package com.payflow.repository;

import com.payflow.entities.Payment;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment , String> {

    Optional<Payment> findByIdempotencyKey(
        String idempotencyKey
    );
}
