package com.payflow.services;

import com.payflow.dto.AccountRequest;
import com.payflow.dto.AccountResponse;
import com.payflow.entities.Account;
import com.payflow.repository.AccountRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AccountService {

    private AccountRepository accountRepository;

    AccountService(AccountRepository accountRepository){
        this.accountRepository = accountRepository;
    }

    @Transactional
    public AccountResponse create(AccountRequest request){

        if(accountRepository.existsByAccountNumber(request.accountNumber())){
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Account Already Exits!"
            );
        }

        Account acc = new Account();

        acc.setAccountNumber(request.accountNumber());
        acc.setBalance(request.balance());;
        acc.setId(request.userId());

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
