package com.payflow.controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/hello")
public class TestController {

    @GetMapping("/a1")
    public String getString(){

        return "Hello_FROM_TEST_CONTROLLER";

    }
}
