package com.housing.society.dto;
import jakarta.validation.constraints.*;
public class AuthDtos {
    public record RegisterRequest(@NotBlank String name,@Email @NotBlank String email,
                                  @NotBlank String phone,@NotBlank @Size(min=6) String password,
                                  @NotBlank String role,String wing,String flatNumber,
                                  String blockNumber,String ownershipStatus,String familyMembers,
                                  String specialization) {}
    public record LoginRequest(@NotBlank String email,@NotBlank String password) {}
    public record LoginResponse(String token, Long userId, String name, String email, String role) {}
}