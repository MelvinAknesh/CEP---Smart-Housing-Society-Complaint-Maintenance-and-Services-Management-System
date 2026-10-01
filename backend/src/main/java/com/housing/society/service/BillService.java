package com.housing.society.service;

import com.housing.society.dto.AdminDtos.BillRequest;
import com.housing.society.entity.*;
import com.housing.society.exception.ResourceNotFoundException;
import com.housing.society.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class BillService {
    private final MaintenanceBillRepository bills; private final ResidentRepository residents;
    private final UserRepository users;
    public BillService(MaintenanceBillRepository bills,ResidentRepository residents,UserRepository users){
        this.bills=bills;this.residents=residents;this.users=users;
    }
    public MaintenanceBill create(BillRequest r){
        Resident res=residents.findById(r.residentId()).orElseThrow(()->new ResourceNotFoundException("Resident not found"));
        MaintenanceBill b=new MaintenanceBill(null,res,r.billingMonth(),r.billingYear(),r.amount(),
                LocalDate.parse(r.dueDate()),"PENDING");
        return bills.save(b);
    }
    public List<MaintenanceBill> my(String email){
        Resident r=residents.findAll().stream().filter(x->x.getUser().getEmail().equalsIgnoreCase(email))
                .findFirst().orElseThrow(()->new ResourceNotFoundException("Resident profile not found"));
        return bills.findByResidentIdOrderByBillingYearDescBillingMonthDesc(r.getId());
    }
    public MaintenanceBill get(Long id){return bills.findById(id).orElseThrow(()->new ResourceNotFoundException("Bill not found"));}
    public void pay(Long id, String email) {
        MaintenanceBill bill = get(id);
        if (!bill.getResident().getUser().getEmail().equalsIgnoreCase(email)) throw new SecurityException("Not authorized");
        bill.setStatus("PAID");
        bills.save(bill);
    }
    public List<MaintenanceBill> all(){return bills.findAll();}
    public void delete(Long id){bills.deleteById(id);}
}