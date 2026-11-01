package com.payflow.repository;

import com.payflow.dto.AccountResponse;
import com.payflow.entities.Account;
import com.payflow.entities.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {

    boolean existsByAccountNumber(String accountNumber);

    boolean existsByUser(User user);

    Optional<Account> findByAccountNumber(String accountNumber);

    AccountResponse findByUserId(User user);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.user = :user")
    Optional<Account> findByUserIdForUpdate(@Param("user") User user);
}

//Why use PESSIMISTIC_WRITE?
//
//Consider this situation:
//        - Sender balance = ₹1,000
//        - Transaction A wants to transfer ₹800.
//        - Transaction B wants to transfer ₹700.
//        Without locking, both transactions might read ₹1,000 and proceed.
//
//With pessimistic locking, one transaction must wait until the other finishes.

//Also, for production-quality transfers, acquire account locks in a consistent order (such as account ID order) to reduce deadlock risks.