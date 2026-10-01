package com.housing.society.repository;
import com.housing.society.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
public interface FeedbackRepository extends JpaRepository<Feedback,Long> {
    boolean existsByComplaintId(Long complaintId);
}