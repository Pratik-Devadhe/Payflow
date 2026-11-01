package com.payflow.repository;

import com.payflow.dto.AccountResponse;
import com.payflow.entities.Account;
import com.payflow.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {

    boolean existsByAccountNumber(String accountNumber);

    Optional<Account> findByAccountNumber(String accountNumber);

    AccountResponse findByUserId(User user);
}