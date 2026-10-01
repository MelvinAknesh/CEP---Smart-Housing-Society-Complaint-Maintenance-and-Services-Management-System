package com.housing.society.service;

import com.housing.society.dto.OtherDtos.PaymentRequest;
import com.housing.society.entity.*;
import com.housing.society.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class PaymentService {
    private final PaymentRepository payments; private final MaintenanceBillRepository bills;
    public PaymentService(PaymentRepository payments,MaintenanceBillRepository bills){
        this.payments=payments;this.bills=bills;
    }
    public Payment pay(String email,PaymentRequest r){
        MaintenanceBill b=bills.findById(r.billId()).orElseThrow(()->new IllegalArgumentException("Bill not found"));
        if(!b.getResident().getUser().getEmail().equalsIgnoreCase(email))
            throw new IllegalArgumentException("This bill does not belong to you");
        if(r.amount() <= 0) throw new IllegalArgumentException("Amount must be positive");
        Payment p=new Payment(null,b,r.amount(),r.paymentMethod(),
                "SIM-"+System.currentTimeMillis(),"SUCCESS",LocalDateTime.now());
        b.setStatus("PAID");bills.save(b);
        return payments.save(p);
    }
}