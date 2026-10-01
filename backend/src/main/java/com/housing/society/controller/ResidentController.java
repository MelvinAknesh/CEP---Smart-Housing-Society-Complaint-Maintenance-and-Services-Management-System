package com.housing.society.controller;

import com.housing.society.entity.Resident;
import com.housing.society.repository.ResidentRepository;
import com.housing.society.exception.ResourceNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

@RestController @RequestMapping("/api/residents")
@PreAuthorize("hasRole('RESIDENT')")
public class ResidentController {
    private final ResidentRepository repo;
    public ResidentController(ResidentRepository repo){this.repo=repo;}
    @GetMapping("/profile") public Resident profile(Authentication a){
        return repo.findAll().stream().filter(r->r.getUser().getEmail().equalsIgnoreCase(a.getName())).findFirst()
            .orElseThrow(()->new ResourceNotFoundException("Profile not found"));
    }
    @PutMapping("/profile") public Resident update(Authentication a,@RequestBody Resident input){
        Resident r=profile(a);
        r.setWing(input.getWing());r.setFlatNumber(input.getFlatNumber());
        r.setBlockNumber(input.getBlockNumber());r.setOwnershipStatus(input.getOwnershipStatus());
        r.setFamilyMembers(input.getFamilyMembers());return repo.save(r);
    }
}