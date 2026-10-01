package com.housing.society.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "residents")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Resident {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional=false)
    @JoinColumn(name="user_id", nullable=false, unique=true)
    private User user;

    private String wing;
    private String flatNumber;
    private String blockNumber;
    private String ownershipStatus;

    @Column(length=1000)
    private String familyMembers;
}
