package com.housing.society.repository;

import com.housing.society.entity.SocietyFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SocietyFeedbackRepository extends JpaRepository<SocietyFeedback, Long> {
    List<SocietyFeedback> findAllByOrderByCreatedAtDesc();
}
