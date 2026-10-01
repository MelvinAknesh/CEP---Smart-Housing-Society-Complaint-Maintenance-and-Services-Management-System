package com.housing.society.controller;

import com.housing.society.dto.ComplaintDtos.*;
import com.housing.society.entity.*;
import com.housing.society.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController @RequestMapping("/api/complaints")
public class ComplaintController {
    private final ComplaintService service;
    public ComplaintController(ComplaintService service){this.service=service;}

    @PostMapping public Complaint create(Authentication a,@Valid @RequestBody CreateComplaintRequest r){return service.create(a.getName(),r);}
    @GetMapping("/my") public List<Complaint> my(Authentication a){return service.my(a.getName());}
    @GetMapping("/{id}") public Complaint get(@PathVariable Long id){return service.get(id);}
    @GetMapping("/{id}/timeline") public List<ComplaintTimeline> timeline(@PathVariable Long id){return service.timeline(id);}
    @PostMapping("/{id}/image") public ResponseEntity<?> image(Authentication a,@PathVariable Long id,@RequestParam("file") MultipartFile file){
        service.uploadImage(id,file,a.getName()); return ResponseEntity.ok(java.util.Map.of("message","Image uploaded"));
    }
    @PutMapping("/{id}/status") public ResponseEntity<?> status(Authentication a,@PathVariable Long id,@Valid @RequestBody StatusUpdateRequest r){
        service.updateStatus(id,a.getName(),r); return ResponseEntity.ok(java.util.Map.of("message","Status updated"));
    }
}