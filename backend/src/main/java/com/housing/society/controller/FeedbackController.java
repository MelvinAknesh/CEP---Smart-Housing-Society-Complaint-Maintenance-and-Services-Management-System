package com.housing.society.controller;
import com.housing.society.dto.OtherDtos.FeedbackRequest;
import com.housing.society.entity.*;
import com.housing.society.repository.*;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/feedback")
@PreAuthorize("hasRole('RESIDENT')")
public class FeedbackController {
    private final FeedbackRepository feedback; private final ComplaintRepository complaints;
    private final ResidentRepository residents;
    public FeedbackController(FeedbackRepository feedback,ComplaintRepository complaints,ResidentRepository residents){
        this.feedback=feedback;this.complaints=complaints;this.residents=residents;
    }
    @PostMapping public Feedback create(Authentication a,@Valid @RequestBody FeedbackRequest r){
        Complaint c=complaints.findById(r.complaintId()).orElseThrow();
        if(c.getStatus()!=Complaint.Status.RESOLVED && c.getStatus()!=Complaint.Status.CLOSED)
            throw new IllegalArgumentException("Feedback is allowed only after resolution");
        if(feedback.existsByComplaintId(c.getId()))throw new IllegalArgumentException("Feedback already submitted");
        Resident res=residents.findAll().stream().filter(x->x.getUser().getEmail().equalsIgnoreCase(a.getName())).findFirst().orElseThrow();
        if(!c.getResident().getId().equals(res.getId()))throw new IllegalArgumentException("Not your complaint");
        return feedback.save(new Feedback(null,c,res,r.rating(),r.review()));
    }
}