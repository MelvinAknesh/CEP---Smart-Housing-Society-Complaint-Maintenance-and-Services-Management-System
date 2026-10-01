package com.housing.society.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name="payments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Payment {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false)
    @JoinColumn(name="bill_id")
    private MaintenanceBill bill;

    private Double amount;
    private String paymentMethod;
    private String transactionReference;
    private String status;
    private LocalDateTime paymentDate;
}
