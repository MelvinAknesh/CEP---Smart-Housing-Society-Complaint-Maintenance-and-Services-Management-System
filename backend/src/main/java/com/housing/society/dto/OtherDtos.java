package com.housing.society.dto;
import jakarta.validation.constraints.*;
public class OtherDtos {
    public record PaymentRequest(@NotNull Long billId,@NotNull Double amount,
                                 @NotBlank String paymentMethod) {}
    public record FeedbackRequest(@NotNull Long complaintId,@Min(1) @Max(5) Integer rating,
                                  String review) {}
    public record ServiceRequestRequest(@NotBlank String serviceType,String description,
                                        @NotBlank String requestedDate) {}
}