package com.housing.society.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name="society_feedback")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SocietyFeedback {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false)
    @JoinColumn(name="user_id")
    private User user;

    @Column(nullable=false, length=2000)
    private String text;

    private LocalDateTime createdAt;
}
