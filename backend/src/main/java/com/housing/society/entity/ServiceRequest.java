package com.housing.society.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name="service_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ServiceRequest {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false)
    @JoinColumn(name="resident_id")
    private Resident resident;

    @Column(nullable=false) private String serviceType;
    @Column(length=2000) private String description;
    private LocalDate requestedDate;
    private String status;
    private LocalDateTime createdAt;
    
    @ManyToOne(optional=true)
    @JoinColumn(name="worker_id")
    private Worker worker;
}
