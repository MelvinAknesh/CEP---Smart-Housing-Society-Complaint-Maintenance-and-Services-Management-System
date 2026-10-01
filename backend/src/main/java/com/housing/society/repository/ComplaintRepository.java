package com.housing.society.repository;
import com.housing.society.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ComplaintRepository extends JpaRepository<Complaint,Long> {
    List<Complaint> findByResidentIdOrderByCreatedAtDesc(Long residentId);
    List<Complaint> findByWorkerIdOrderByCreatedAtDesc(Long workerId);
    List<Complaint> findAllByOrderByCreatedAtDesc();
    List<Complaint> findByEscalatedTrueOrderByCreatedAtDesc();
    long countByEscalatedTrue();
    long countByPriority(Complaint.Priority priority);
}