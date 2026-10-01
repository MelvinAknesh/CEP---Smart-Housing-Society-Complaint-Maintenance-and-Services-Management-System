package com.housing.society.dto;
import jakarta.validation.constraints.*;
public class ComplaintDtos {
    public record CreateComplaintRequest(@NotBlank String title,@NotBlank String description,
                                          @NotBlank String category) {}
    public record StatusUpdateRequest(@NotBlank String status,String remarks) {}
    public record AssignRequest(@NotNull Long workerId) {}
}