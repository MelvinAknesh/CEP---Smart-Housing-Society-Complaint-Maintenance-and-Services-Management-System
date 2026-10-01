package com.housing.society.repository;
import com.housing.society.entity.MaintenanceBill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface MaintenanceBillRepository extends JpaRepository<MaintenanceBill,Long> {
    List<MaintenanceBill> findByResidentIdOrderByBillingYearDescBillingMonthDesc(Long residentId);
    List<MaintenanceBill> findByStatus(String status);
}