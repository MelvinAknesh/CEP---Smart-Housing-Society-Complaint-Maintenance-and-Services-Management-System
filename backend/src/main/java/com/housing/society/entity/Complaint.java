package com.housing.society.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Complaint {
    public enum Status { CREATED, ACKNOWLEDGED, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED }
    public enum Priority { EMERGENCY, HIGH, MEDIUM, LOW }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false) private String title;
    @Column(nullable=false, length=3000) private String description;
    @Column(nullable=false) private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private Priority priority;

    private Integer slaHours;
    private Integer escalationHours;
    private LocalDateTime createdAt;
    private LocalDateTime slaDeadline;
    private LocalDateTime escalationDeadline;
    private LocalDateTime assignedAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime closedAt;
    private boolean escalated = false;
    private boolean overdue = false;
    private String imagePath;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private Status status = Status.CREATED;

    @ManyToOne(optional=false)
    @JoinColumn(name="resident_id")
    private Resident resident;

    @ManyToOne
    @JoinColumn(name="worker_id")
    private Worker worker;

    @Column(length=2000)
    private String resolutionRemarks;
}
