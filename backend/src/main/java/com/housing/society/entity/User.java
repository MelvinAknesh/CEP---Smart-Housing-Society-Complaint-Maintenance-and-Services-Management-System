package com.housing.society.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class User {
    public enum Role { RESIDENT, ADMIN, WORKER }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false) private String name;
    @Column(nullable=false, unique=true) private String email;
    @Column(nullable=false) private String password;
    @Column(nullable=false, unique=true) private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private Role role;

    private boolean active = true;
}
