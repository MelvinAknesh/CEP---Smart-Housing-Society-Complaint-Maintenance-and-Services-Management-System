package com.housing.society.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="feedback")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Feedback {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional=false)
    @JoinColumn(name="complaint_id", unique=true)
    private Complaint complaint;

    @ManyToOne(optional=false)
    @JoinColumn(name="resident_id")
    private Resident resident;

    @Column(nullable=false)
    private Integer rating;

    @Column(length=2000)
    private String review;
}
