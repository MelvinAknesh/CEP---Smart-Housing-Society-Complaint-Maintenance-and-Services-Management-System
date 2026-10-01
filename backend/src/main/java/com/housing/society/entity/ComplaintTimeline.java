package com.housing.society.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name="complaint_timeline")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ComplaintTimeline {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false)
    @JoinColumn(name="complaint_id")
    private Complaint complaint;

    @Column(nullable=false) private String status;
    private String remarks;
    @Column(nullable=false) private LocalDateTime timestamp;
}
