package com.housing.society.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name="maintenance_bills")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MaintenanceBill {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false)
    @JoinColumn(name="resident_id")
    private Resident resident;

    private String billingMonth;
    private Integer billingYear;
    private Double amount;
    private LocalDate dueDate;
    private String status;
}
