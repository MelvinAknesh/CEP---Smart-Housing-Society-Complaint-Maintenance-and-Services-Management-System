package com.housing.society.dto;
import jakarta.validation.constraints.*;
public class AdminDtos {
    public record ApprovedMemberRequest(@NotBlank String phone,@NotBlank String email,@NotBlank String fullName,
                                        @NotBlank String role,String wing,String flatNumber,
                                        String specialization) {}
    public record WorkerAvailabilityRequest(boolean available) {}
    public record UserUpdateRequest(String name, String email, String phone, boolean active) {}
    public record BillRequest(@NotNull Long residentId,@NotNull Double amount,
                              @NotBlank String billingMonth,@NotNull Integer billingYear,
                              @NotNull String dueDate) {}
    public record NoticeRequest(@NotBlank String title,@NotBlank String content) {}
}