package com.housing.society.controller;

import com.housing.society.dto.AdminDtos.*;
import com.housing.society.dto.ComplaintDtos.AssignRequest;
import com.housing.society.entity.*;
import com.housing.society.repository.*;
import com.housing.society.service.*;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final ComplaintService complaints; private final UserRepository users;
    private final WorkerRepository workers; private final ResidentRepository residents;
    private final ApprovedMemberRepository approved; private final BillService bills;
    private final NoticeRepository notices;
    private final ServiceRequestService serviceRequests;
    @org.springframework.beans.factory.annotation.Autowired private MaintenanceBillRepository billRepo;
    @org.springframework.beans.factory.annotation.Autowired private ComplaintRepository complaintRepo;
    @org.springframework.beans.factory.annotation.Autowired private ServiceRequestRepository serviceRepo;
    @org.springframework.beans.factory.annotation.Autowired private com.housing.society.repository.SocietyFeedbackRepository fbRepo;
    @org.springframework.beans.factory.annotation.Autowired private com.housing.society.repository.NotificationRepository notifRepo;
    @org.springframework.beans.factory.annotation.Autowired private com.housing.society.repository.PaymentRepository paymentRepo;
    @org.springframework.beans.factory.annotation.Autowired private com.housing.society.repository.ComplaintTimelineRepository timelineRepo;
    @org.springframework.beans.factory.annotation.Autowired private com.housing.society.repository.FeedbackRepository complaintFeedbackRepo;
    @org.springframework.beans.factory.annotation.Autowired private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public AdminController(ComplaintService complaints,UserRepository users,WorkerRepository workers,
                           ResidentRepository residents,ApprovedMemberRepository approved,
                           BillService bills,NoticeRepository notices, ServiceRequestService serviceRequests){
        this.complaints=complaints;this.users=users;this.workers=workers;this.residents=residents;
        this.approved=approved;this.bills=bills;this.notices=notices;this.serviceRequests=serviceRequests;
    }

    @GetMapping("/dashboard")
    public Map<String,Object> dashboard(){
        return Map.of("totalResidents",residents.count(),
            "activeWorkers",workers.countByAvailableTrue(),
            "escalatedComplaints",complaints.escalated().size(),
            "emergencyComplaints",complaints.all().stream().filter(c->c.getPriority()==Complaint.Priority.EMERGENCY).count());
    }

    @GetMapping("/complaints") public List<Complaint> all(){return complaints.all();}
    @GetMapping("/complaints/escalated") public List<Complaint> escalated(){return complaints.escalated();}
    @GetMapping("/complaints/{id}/suggested-workers") public List<Worker> suggestions(@PathVariable Long id){return complaints.suggestedWorkers(id);}
    @PutMapping("/complaints/{id}/assign") public Map<String,String> assign(@PathVariable Long id,@Valid @RequestBody AssignRequest r){
        complaints.assign(id,r.workerId());return Map.of("message","Worker assigned");
    }
    
    @GetMapping("/service-requests") public List<ServiceRequest> allServiceRequests() {
        return serviceRequests.all();
    }
    
    @PutMapping("/service-requests/{id}/assign") public Map<String,String> assignService(@PathVariable Long id,@Valid @RequestBody AssignRequest r){
        serviceRequests.assign(id,r.workerId());return Map.of("message","Worker assigned to service request");
    }

    @PostMapping("/approved-members")
    public ApprovedMember addApproved(@Valid @RequestBody ApprovedMemberRequest r){
        User.Role role=User.Role.valueOf(r.role().toUpperCase());
        if(users.findByPhone(r.phone()).isPresent()){
            throw new IllegalArgumentException("Phone already registered to an active member");
        }
        if(users.findByEmail(r.email()).isPresent()){
            throw new IllegalArgumentException("Email already registered to an active member");
        }

        approved.findByPhone(r.phone()).ifPresent(a -> approved.delete(a));
        approved.findByEmail(r.email()).ifPresent(a -> approved.delete(a));
        return approved.save(new ApprovedMember(null,r.phone(),r.email(),r.fullName(),role,r.wing(),r.flatNumber(),
            r.specialization(),false,true));
    }

    @DeleteMapping("/members/{id}")
    public Map<String,String> deleteMember(@PathVariable String id){
        if(id.startsWith("P-")){
            approved.deleteById(Long.parseLong(id.substring(2)));
        } else {
            Long rawId = Long.parseLong(id.substring(2));
            users.findById(rawId).ifPresent(u -> {
                if(id.startsWith("R-")){
                    residents.findByUserId(rawId).ifPresent(r->{
                        paymentRepo.deleteAll(paymentRepo.findByBillResidentIdOrderByPaymentDateDesc(r.getId()));
                        billRepo.deleteAll(billRepo.findByResidentIdOrderByBillingYearDescBillingMonthDesc(r.getId()));
                        
                        var userComplaints = complaintRepo.findByResidentIdOrderByCreatedAtDesc(r.getId());
                        userComplaints.forEach(c -> {
                            timelineRepo.findAll().stream().filter(t -> t.getComplaint().getId().equals(c.getId())).forEach(timelineRepo::delete);
                            complaintFeedbackRepo.findAll().stream().filter(f -> f.getComplaint().getId().equals(c.getId())).forEach(complaintFeedbackRepo::delete);
                        });
                        complaintRepo.deleteAll(userComplaints);
                        
                        serviceRepo.deleteAll(serviceRepo.findByResidentIdOrderByCreatedAtDesc(r.getId()));
                        residents.delete(r);
                    });
                } else if(id.startsWith("W-")){
                    workers.findByUserId(rawId).ifPresent(w->{
                        complaintRepo.findByWorkerIdOrderByCreatedAtDesc(w.getId()).forEach(c -> {
                            c.setWorker(null);
                            c.setStatus(Complaint.Status.CREATED);
                            complaintRepo.save(c);
                        });
                        // ServiceRequests don't have findByWorkerId so we'll just find all and filter
                        serviceRepo.findAll().stream().filter(s -> s.getWorker() != null && s.getWorker().getId().equals(w.getId())).forEach(s -> {
                            s.setWorker(null);
                            s.setStatus("PENDING");
                            serviceRepo.save(s);
                        });
                        workers.delete(w);
                    });
                }
                approved.findByPhone(u.getPhone()).ifPresent(a->approved.delete(a));
                fbRepo.findAll().stream().filter(f -> f.getUser().getId().equals(u.getId())).forEach(f -> fbRepo.delete(f));
                notifRepo.deleteAll(notifRepo.findByUserIdOrderByCreatedAtDesc(u.getId()));
                users.delete(u);
            });
        }
        return Map.of("message", "Member deleted");
    }

    @GetMapping("/users") public List<User> users(){return users.findAll();}
    @GetMapping("/approved-members") public List<ApprovedMember> approved(){return approved.findAll();}
    @PutMapping("/users/{id}/deactivate") public Map<String,String> deactivate(@PathVariable Long id){
        User u=users.findById(id).orElseThrow();u.setActive(false);users.save(u);return Map.of("message","User deactivated");
    }
    @PutMapping("/workers/{id}/availability")
    public Map<String,String> availability(@PathVariable Long id,@RequestBody WorkerAvailabilityRequest r){
        Worker w=workers.findById(id).orElseThrow();w.setAvailable(r.available());workers.save(w);
        return Map.of("message","Availability updated");
    }

    @GetMapping("/bills") public List<MaintenanceBill> allBills(){return bills.all();}
    @DeleteMapping("/bills/{id}") public Map<String,String> deleteBill(@PathVariable Long id){
        bills.delete(id);return Map.of("message","Bill deleted");
    }
    @GetMapping("/workers") public List<Worker> allWorkers(){return workers.findByAvailableTrue();}
    @GetMapping("/residents") public List<Resident> allResidents(){return residents.findAll();}
    @PostMapping("/bills") public MaintenanceBill bill(@Valid @RequestBody BillRequest r){return bills.create(r);}
    @PostMapping("/notices") public Notice notice(@Valid @RequestBody NoticeRequest r){
        Notice n=new Notice(null,r.title(),r.content(),java.time.LocalDateTime.now(),true);return notices.save(n);
    }
    @PutMapping("/notices/{id}") public Notice edit(@PathVariable Long id,@Valid @RequestBody NoticeRequest r){
        Notice n=notices.findById(id).orElseThrow();n.setTitle(r.title());n.setContent(r.content());return notices.save(n);
    }
    @DeleteMapping("/notices/{id}") public Map<String,String> archive(@PathVariable Long id){
        Notice n=notices.findById(id).orElseThrow();n.setActive(false);notices.save(n);return Map.of("message","Notice archived");
    }
}