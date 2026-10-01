package com.housing.society.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "workers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Worker {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional=false)
    @JoinColumn(name="user_id", nullable=false, unique=true)
    private User user;

    private String specialization;
    private boolean available = true;

    @Column(length=1000)
    private String profile;
}
