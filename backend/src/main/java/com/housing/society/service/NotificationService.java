package com.housing.society.service;

import com.housing.society.entity.*;
import com.housing.society.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class NotificationService {
    private final NotificationRepository repo;
    public NotificationService(NotificationRepository repo){this.repo=repo;}
    public void notify(User user,String message,String type){
        Notification n=new Notification(null,user,message,type,false,LocalDateTime.now());
        repo.save(n);
    }
}