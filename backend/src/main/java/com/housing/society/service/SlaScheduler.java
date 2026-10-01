package com.housing.society.service;

import com.housing.society.entity.Complaint;
import com.housing.society.repository.ComplaintRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class SlaScheduler {
    private final ComplaintRepository repo; private final NotificationService notifications;
    public SlaScheduler(ComplaintRepository repo,NotificationService notifications){
        this.repo=repo;this.notifications=notifications;
    }
    @Scheduled(fixedDelay=300000)
    public void monitor(){
        LocalDateTime now=LocalDateTime.now();
        for(Complaint c:repo.findAll()){
            if(c.getStatus()==Complaint.Status.CLOSED || c.getStatus()==Complaint.Status.RESOLVED) continue;
            boolean changed=false;
            if(!c.isEscalated() && c.getWorker()==null && c.getEscalationDeadline()!=null && now.isAfter(c.getEscalationDeadline())){
                c.setEscalated(true);changed=true;
                notifications.notify(c.getResident().getUser(),"Complaint #"+c.getId()+" has been escalated because it was not assigned within the warning period","SLA_ESCALATION");
            }
            if(!c.isOverdue() && c.getSlaDeadline()!=null && now.isAfter(c.getSlaDeadline())){
                c.setOverdue(true);changed=true;
                notifications.notify(c.getResident().getUser(),"Complaint #"+c.getId()+" is overdue","SLA_OVERDUE");
            }
            if(changed)repo.save(c);
        }
    }
}