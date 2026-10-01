package com.housing.society.controller;
import com.housing.society.dto.OtherDtos.PaymentRequest;
import com.housing.society.entity.Payment;
import com.housing.society.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService service;
    public PaymentController(PaymentService service){this.service=service;}
    @PostMapping("/simulate") public Payment pay(Authentication a,@Valid @RequestBody PaymentRequest r){return service.pay(a.getName(),r);}
}