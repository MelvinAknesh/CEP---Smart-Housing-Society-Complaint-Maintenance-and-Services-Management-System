package com.housing.society.controller;

import com.housing.society.entity.Notification;
import com.housing.society.repository.*;
import com.housing.society.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationRepository repo;
    private final UserRepository users;

    public NotificationController(NotificationRepository repo, UserRepository users) {
        this.repo = repo;
        this.users = users;
    }

    @GetMapping
    public List<Notification> all(Authentication a) {
        User u = users.findByEmail(a.getName()).orElseThrow();
        return repo.findByUserIdOrderByCreatedAtDesc(u.getId());
    }

    @PutMapping("/{id}/read")
    public Notification read(Authentication a, @PathVariable Long id) {
        Notification n = repo.findById(id).orElseThrow();
        if (!n.getUser().getEmail().equalsIgnoreCase(a.getName()))
            throw new IllegalArgumentException("Not your notification");
        n.setReadStatus(true);
        return repo.save(n);
    }
}