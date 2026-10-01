package com.housing.society.controller;

import com.housing.society.entity.SocietyFeedback;
import com.housing.society.entity.User;
import com.housing.society.entity.Resident;
import com.housing.society.entity.Worker;
import com.housing.society.repository.SocietyFeedbackRepository;
import com.housing.society.repository.UserRepository;
import com.housing.society.repository.ResidentRepository;
import com.housing.society.repository.WorkerRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/society-feedback")
public class SocietyFeedbackController {

    private final SocietyFeedbackRepository feedbackRepo;
    private final UserRepository userRepo;
    private final ResidentRepository residentRepo;
    private final WorkerRepository workerRepo;
    private final com.housing.society.repository.ApprovedMemberRepository approvedRepo;

    public SocietyFeedbackController(SocietyFeedbackRepository feedbackRepo, UserRepository userRepo, ResidentRepository residentRepo, WorkerRepository workerRepo, com.housing.society.repository.ApprovedMemberRepository approvedRepo) {
        this.feedbackRepo = feedbackRepo;
        this.userRepo = userRepo;
        this.residentRepo = residentRepo;
        this.workerRepo = workerRepo;
        this.approvedRepo = approvedRepo;
    }

    @GetMapping
    public List<Map<String, Object>> getAll() {
        return feedbackRepo.findAllByOrderByCreatedAtDesc().stream().map(fb -> {
            User u = fb.getUser();
            String authorName = "Unknown";
            
            var approved = approvedRepo.findByEmail(u.getEmail());
            if (approved.isPresent()) {
                authorName = approved.get().getFullName() + " (" + (u.getRole() == User.Role.RESIDENT ? "Resident" : "Worker") + ")";
            } else if (u.getRole() == User.Role.ADMIN) {
                authorName = "Admin";
            }
            
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", fb.getId());
            map.put("author", authorName);
            map.put("text", fb.getText());
            map.put("date", fb.getCreatedAt().toString());
            return map;
        }).collect(Collectors.toList());
    }

    @PostMapping
    public SocietyFeedback create(Authentication a, @RequestBody Map<String, String> payload) {
        User u = userRepo.findByEmail(a.getName()).orElseThrow();
        String text = payload.get("text");
        if(text == null || text.trim().isEmpty()) throw new IllegalArgumentException("Text cannot be empty");
        
        SocietyFeedback fb = new SocietyFeedback(null, u, text, LocalDateTime.now());
        return feedbackRepo.save(fb);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteFeedback(@PathVariable Long id) {
        feedbackRepo.deleteById(id);
    }
}
