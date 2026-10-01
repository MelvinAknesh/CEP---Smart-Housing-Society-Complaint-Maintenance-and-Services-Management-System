package com.housing.society.repository;

import com.housing.society.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment,Long> {
    List<Payment> findByBillResidentIdOrderByPaymentDateDesc(Long residentId);
}
