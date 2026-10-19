package com.payflow.repository;

import com.payflow.entities.Payment;
import org.hibernate.internal.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment , String> {

    Optional<Payment> findByIdempotencyKey(
        String idempotencyKey
    );
}
