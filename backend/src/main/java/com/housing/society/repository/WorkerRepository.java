package com.housing.society.repository;
import com.housing.society.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface WorkerRepository extends JpaRepository<Worker,Long> {
    List<Worker> findByAvailableTrue();
    List<Worker> findBySpecializationIgnoreCaseAndAvailableTrue(String specialization);
    Optional<Worker> findByUserId(Long userId);
    long countByAvailableTrue();
}