package com.housing.society.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name="notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Notification {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false)
    @JoinColumn(name="user_id")
    private User user;

    @Column(nullable=false, length=2000) private String message;
    private String type;
    private boolean readStatus = false;
    private LocalDateTime createdAt;
}
