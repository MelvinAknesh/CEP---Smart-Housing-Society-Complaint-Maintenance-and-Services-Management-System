package com.housing.society.service;

import com.housing.society.dto.OtherDtos.ServiceRequestRequest;
import com.housing.society.entity.*;
import com.housing.society.repository.*;
import org.springframework.stereotype.Service;
import java.time.*;

@Service
public class ServiceRequestService {
    private final ServiceRequestRepository repo; private final ResidentRepository residents;
    private final WorkerRepository workers;
    public ServiceRequestService(ServiceRequestRepository repo,ResidentRepository residents, WorkerRepository workers){
        this.repo=repo;this.residents=residents;this.workers=workers;
    }
    public ServiceRequest create(String email,ServiceRequestRequest r){
        Resident resident=residents.findAll().stream().filter(x->x.getUser().getEmail().equalsIgnoreCase(email))
            .findFirst().orElseThrow(()->new IllegalArgumentException("Resident profile not found"));
        return repo.save(new ServiceRequest(null,resident,r.serviceType(),r.description(),
            LocalDate.parse(r.requestedDate()),"REQUESTED",LocalDateTime.now(), null));
    }
    public java.util.List<ServiceRequest> my(String email){
        Resident r=residents.findAll().stream().filter(x->x.getUser().getEmail().equalsIgnoreCase(email))
            .findFirst().orElseThrow(()->new IllegalArgumentException("Resident profile not found"));
        return repo.findByResidentIdOrderByCreatedAtDesc(r.getId());
    }
    
    public java.util.List<ServiceRequest> all() {
        return repo.findAll();
    }
    
    public void assign(Long id, Long workerId) {
        ServiceRequest s = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("ServiceRequest not found"));
        Worker w = workers.findById(workerId).orElseThrow(() -> new IllegalArgumentException("Worker not found"));
        s.setWorker(w);
        s.setStatus("ASSIGNED");
        repo.save(s);
    }
}