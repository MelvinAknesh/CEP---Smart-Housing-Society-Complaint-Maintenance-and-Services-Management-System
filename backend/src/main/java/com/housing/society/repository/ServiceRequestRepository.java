package com.housing.society.repository;
import com.housing.society.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest,Long> {
    List<ServiceRequest> findByResidentIdOrderByCreatedAtDesc(Long residentId);
}