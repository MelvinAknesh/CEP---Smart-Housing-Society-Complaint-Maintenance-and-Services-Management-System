package com.housing.society.repository;
import com.housing.society.entity.Resident;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface ResidentRepository extends JpaRepository<Resident,Long> {
    Optional<Resident> findByUserId(Long userId);
}