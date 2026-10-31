package com.payflow.controller;

import com.payflow.dto.AccountRequest;
import com.payflow.dto.AccountResponse;
import com.payflow.services.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private AccountService accountservice;

    AccountController(AccountService accountservice){
        this.accountservice = accountservice;
    }

//    create an account

    @PostMapping
    public ResponseEntity<AccountResponse> create(@Valid @RequestBody AccountRequest request){
        AccountResponse response =  accountservice.create(request);

        return new ResponseEntity<>(response , HttpStatus.CREATED);
    }

    @GetMapping("/{number}")
    public ResponseEntity<AccountResponse> getByAccountNumber(@PathVariable String accountNumber){
        return ResponseEntity.ok(accountservice.getByAccountNumber(accountNumber));
    }

    @GetMapping
    public ResponseEntity<List<AccountResponse>> getAllAccounts(){
        return ResponseEntity.ok(accountservice.getAll());
    }

}
