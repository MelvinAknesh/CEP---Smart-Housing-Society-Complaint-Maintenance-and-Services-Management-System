package com.housing.society.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name="notices")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Notice {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false) private String title;
    @Column(nullable=false, length=5000) private String content;
    private LocalDateTime createdAt;
    private boolean active = true;
}
