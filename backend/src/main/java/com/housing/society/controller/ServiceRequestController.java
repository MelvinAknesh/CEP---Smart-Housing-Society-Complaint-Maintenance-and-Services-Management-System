package com.housing.society.controller;
import com.housing.society.dto.OtherDtos.ServiceRequestRequest;
import com.housing.society.entity.ServiceRequest;
import com.housing.society.service.ServiceRequestService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/service-requests")
@PreAuthorize("hasRole('RESIDENT')")
public class ServiceRequestController {
    private final ServiceRequestService service;
    public ServiceRequestController(ServiceRequestService service){this.service=service;}
    @PostMapping public ServiceRequest create(Authentication a,@Valid @RequestBody ServiceRequestRequest r){return service.create(a.getName(),r);}
    @GetMapping("/my") public List<ServiceRequest> my(Authentication a){return service.my(a.getName());}
}