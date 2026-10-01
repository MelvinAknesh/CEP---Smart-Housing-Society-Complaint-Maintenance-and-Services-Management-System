package com.housing.society.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "approved_members")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ApprovedMember {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, unique=true) private String phone;
    @Column(nullable=false, unique=true) private String email;
    @Column(nullable=false) private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private User.Role role;

    private String wing;
    private String flatNumber;
    private String specialization;
    private boolean registered = false;
    private boolean active = true;
}
