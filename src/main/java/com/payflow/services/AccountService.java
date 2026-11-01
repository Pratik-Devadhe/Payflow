package com.payflow.services;

import com.payflow.dto.AccountRequest;
import com.payflow.dto.AccountResponse;
import com.payflow.entities.Account;
import com.payflow.entities.User;
import com.payflow.repository.AccountRepository;
import com.payflow.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AccountService {

    private AccountRepository accountRepository;
    private UserRepository userRepository;

    AccountService(AccountRepository accountRepository, UserRepository userRepository){
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AccountResponse create(AccountRequest request){

        if(accountRepository.existsByAccountNumber(request.accountNumber())){
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Account Already Exits!"
            );
        }

        User user = userRepository.findById(request.userId())
                .orElseThrow( () -> new RuntimeException("User Not Found"));

        Account acc = new Account();

        acc.setAccountNumber(request.accountNumber());
        acc.setBalance(request.balance());;
        acc.setUser(user);

        Account savedAccount = accountRepository.save(acc);

        return convertToResponse(savedAccount);
    }

    public AccountResponse getByAccountNumber(String accountNumber){
         Account acc = accountRepository.findByAccountNumber(accountNumber)
                 .orElseThrow( () -> new ResponseStatusException(
                         HttpStatus.NOT_FOUND,
                         "Account not found"
                 ));
         return convertToResponse(acc);
    }

    public List<AccountResponse> getAll(){
        return accountRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    private AccountResponse convertToResponse(Account account){
        return new AccountResponse(
                account.getId(),
                account.getAccountNumber(),
                account.getBalance(),
                account.getCurrency(),
                account.getStatus(),
                account.getCreatedAt()
        );
    }

}
