package com.housing.society.controller;

import com.housing.society.entity.*;
import com.housing.society.repository.WorkerRepository;
import com.housing.society.service.ComplaintService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/workers")
@PreAuthorize("hasRole('WORKER')")
public class WorkerController {
    private final WorkerRepository workers; private final ComplaintService complaints;
    public WorkerController(WorkerRepository workers,ComplaintService complaints){this.workers=workers;this.complaints=complaints;}
    @GetMapping("/profile") public Worker profile(Authentication a){
        return workers.findByUserId(
            workers.findAll().stream().filter(w->w.getUser().getEmail().equalsIgnoreCase(a.getName()))
            .findFirst().orElseThrow().getUser().getId()).orElseThrow();
    }
    @GetMapping("/tasks") public List<Complaint> tasks(Authentication a){
        Worker w=workers.findAll().stream().filter(x->x.getUser().getEmail().equalsIgnoreCase(a.getName())).findFirst().orElseThrow();
        return complaints.all().stream().filter(c->c.getWorker()!=null && c.getWorker().getId().equals(w.getId())).toList();
    }
}