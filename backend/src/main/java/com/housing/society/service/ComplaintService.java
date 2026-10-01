package com.housing.society.service;

import com.housing.society.dto.ComplaintDtos.*;
import com.housing.society.entity.*;
import com.housing.society.exception.ResourceNotFoundException;
import com.housing.society.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComplaintService {
    private final ComplaintRepository complaints; private final ResidentRepository residents;
    private final WorkerRepository workers; private final ComplaintTimelineRepository timeline;
    private final NotificationService notifications;

    public ComplaintService(ComplaintRepository complaints,ResidentRepository residents,
                            WorkerRepository workers,ComplaintTimelineRepository timeline,
                            NotificationService notifications){
        this.complaints=complaints;this.residents=residents;this.workers=workers;
        this.timeline=timeline;this.notifications=notifications;
    }

    public Complaint create(String email,CreateComplaintRequest r){
        Resident resident=residents.findAll().stream()
            .filter(x->x.getUser().getEmail().equalsIgnoreCase(email)).findFirst()
            .orElseThrow(()->new ResourceNotFoundException("Resident profile not found"));
        SlaService.Rule rule=SlaService.ruleFor(r.category());
        LocalDateTime now=LocalDateTime.now();
        Complaint c=new Complaint();
        c.setTitle(r.title());c.setDescription(r.description());c.setCategory(r.category());
        c.setPriority(rule.priority());c.setSlaHours(rule.slaHours());c.setEscalationHours(rule.escalationHours());
        c.setCreatedAt(now);c.setSlaDeadline(now.plusHours(rule.slaHours()));
        c.setEscalationDeadline(now.plusHours(rule.escalationHours()));
        c.setStatus(Complaint.Status.CREATED);c.setResident(resident);
        c=complaints.save(c); addTimeline(c,"CREATED","Complaint submitted");
        return c;
    }

    public void uploadImage(Long id, MultipartFile file, String email){
        Complaint c=get(id);
        if(!c.getResident().getUser().getEmail().equalsIgnoreCase(email))
            throw new IllegalArgumentException("You can upload only to your complaint");
        if(file.isEmpty()) throw new IllegalArgumentException("Empty file");
        try{
            Path dir=Paths.get("uploads/complaints");Files.createDirectories(dir);
            String safe=System.currentTimeMillis()+"_"+file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]","_");
            Path target=dir.resolve(safe);Files.copy(file.getInputStream(),target,StandardCopyOption.REPLACE_EXISTING);
            c.setImagePath("/uploads/complaints/"+safe);complaints.save(c);
        }catch(IOException e){throw new IllegalArgumentException("Could not save image");}
    }

    public Complaint get(Long id){return complaints.findById(id).orElseThrow(()->new ResourceNotFoundException("Complaint not found"));}

    public List<Complaint> my(String email){
        return complaints.findAllByOrderByCreatedAtDesc().stream()
            .filter(c-> (c.getResident() != null && c.getResident().getUser().getEmail().equalsIgnoreCase(email)) ||
                        (c.getWorker() != null && c.getWorker().getUser().getEmail().equalsIgnoreCase(email)))
            .toList();
    }
    public List<Complaint> all(){return complaints.findAllByOrderByCreatedAtDesc();}
    public List<Complaint> escalated(){return complaints.findByEscalatedTrueOrderByCreatedAtDesc();}

    public void assign(Long complaintId,Long workerId){
        Complaint c=get(complaintId);
        Worker w=workers.findById(workerId).orElseThrow(()->new ResourceNotFoundException("Worker not found"));
        if(!w.isAvailable()) throw new IllegalArgumentException("Worker is not available");
        c.setWorker(w);c.setAssignedAt(LocalDateTime.now());c.setStatus(Complaint.Status.ASSIGNED);
        complaints.save(c);addTimeline(c,"ASSIGNED","Assigned to "+w.getUser().getName());
        notifications.notify(w.getUser(),"Complaint #"+c.getId()+" has been assigned to you","COMPLAINT_ASSIGNED");
    }

    public void updateStatus(Long id,String email,StatusUpdateRequest r){
        Complaint c=get(id);
        boolean isWorker=c.getWorker()!=null && c.getWorker().getUser().getEmail().equalsIgnoreCase(email);
        boolean isResident=c.getResident().getUser().getEmail().equalsIgnoreCase(email);
        if(!isWorker && !isResident) throw new IllegalArgumentException("Not authorized for this complaint");
        Complaint.Status s;
        try{s=Complaint.Status.valueOf(r.status().toUpperCase());}
        catch(Exception e){throw new IllegalArgumentException("Invalid status");}
        if(isWorker && (s==Complaint.Status.IN_PROGRESS || s==Complaint.Status.RESOLVED || s==Complaint.Status.ACKNOWLEDGED)){
            if(s==Complaint.Status.IN_PROGRESS)c.setStartedAt(LocalDateTime.now());
            if(s==Complaint.Status.RESOLVED)c.setCompletedAt(LocalDateTime.now());
        }
        if(isResident && s!=Complaint.Status.CLOSED) throw new IllegalArgumentException("Resident can only close a resolved complaint");
        if(isResident && c.getStatus()!=Complaint.Status.RESOLVED) throw new IllegalArgumentException("Complaint is not resolved");
        if(s==Complaint.Status.CLOSED)c.setClosedAt(LocalDateTime.now());
        c.setStatus(s);complaints.save(c);addTimeline(c,s.name(),r.remarks());
    }

    private void addTimeline(Complaint c,String status,String remarks){
        timeline.save(new ComplaintTimeline(null,c,status,remarks,LocalDateTime.now()));
    }
    public List<ComplaintTimeline> timeline(Long id){get(id);return timeline.findByComplaintIdOrderByTimestampAsc(id);}
    public List<Worker> suggestedWorkers(Long id){
        Complaint c=get(id);
        return workers.findBySpecializationIgnoreCaseAndAvailableTrue(specializationFor(c.getCategory()));
    }
    private String specializationFor(String category){
        String x=category.toLowerCase();
        if(x.contains("electrical")||x.contains("short"))return "Electrician";
        if(x.contains("plumbing")||x.contains("water"))return "Plumber";
        if(x.contains("lift"))return "Lift Technician";
        if(x.contains("clean"))return "Cleaner";
        if(x.contains("pest")||x.contains("gas"))return "Pest Control";
        return "Maintenance";
    }
}