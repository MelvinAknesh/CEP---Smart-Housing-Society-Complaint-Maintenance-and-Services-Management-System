package com.housing.society.controller;

import com.housing.society.dto.AuthDtos.*;
import com.housing.society.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final AuthService service;
    public AuthController(AuthService service){this.service=service;}
    @PostMapping("/register") public LoginResponse register(@Valid @RequestBody RegisterRequest r){return service.register(r);}
    @PostMapping("/login") public LoginResponse login(@Valid @RequestBody LoginRequest r){return service.login(r);}
}