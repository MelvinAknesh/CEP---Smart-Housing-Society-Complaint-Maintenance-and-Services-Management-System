package com.housing.society.controller;
import com.housing.society.entity.MaintenanceBill;
import com.housing.society.service.BillService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/bills")
@PreAuthorize("hasRole('RESIDENT')")
public class BillController {
    private final BillService service;
    public BillController(BillService service){this.service=service;}
    @GetMapping("/my") public List<MaintenanceBill> my(Authentication a){return service.my(a.getName());}
    @PutMapping("/{id}/pay") public java.util.Map<String,String> pay(@PathVariable Long id, Authentication a){
        service.pay(id, a.getName());
        return java.util.Map.of("message", "Bill paid");
    }
}