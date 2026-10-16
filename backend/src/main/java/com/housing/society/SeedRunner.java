package com.housing.society;

import com.housing.society.dto.AuthDtos.RegisterRequest;
import com.housing.society.entity.ApprovedMember;
import com.housing.society.entity.User;
import com.housing.society.repository.ApprovedMemberRepository;
import com.housing.society.repository.UserRepository;
import com.housing.society.service.AuthService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class SeedRunner implements CommandLineRunner {
    private final AuthService authService;
    private final UserRepository users;
    private final ApprovedMemberRepository approved;

    public SeedRunner(AuthService authService, UserRepository users, ApprovedMemberRepository approved) {
        this.authService = authService;
        this.users = users;
        this.approved = approved;
    }

    private void seedOrUpdate(String name, String email, String phone, String roleStr, String wing, String flatNumber, String specialization) {
        try {
            User.Role role = User.Role.valueOf(roleStr);

            ApprovedMember m = approved.findByEmail(email).orElse(null);
            if (m == null) {
                m = approved.save(new ApprovedMember(null, phone, email, name, role, wing, flatNumber, specialization, false, true));
            } else {
                m.setPhone(phone);
                m.setFullName(name);
                m.setWing(wing);
                m.setFlatNumber(flatNumber);
                m.setSpecialization(specialization);
                m.setActive(true);
                approved.save(m);
            }

            User u = users.findByEmail(email).orElse(null);
            if (u != null) {
                u.setPhone(phone);
                u.setName(name);
                users.save(u);
                m.setRegistered(true);
                approved.save(m);
                System.out.println("Updated phone for " + name + " -> " + phone);
            } else {
                authService.register(new RegisterRequest(
                    name, email, phone, "Society@123", roleStr, wing, flatNumber, null, null, null, specialization
                ));
                System.out.println("Registered " + name + " with phone " + phone);
            }
        } catch (Exception e) {
            System.out.println("Seed error for " + name + ": " + e.getMessage());
        }
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("--- SEEDING & SYNCING USERS WITH UNIQUE PHONE NUMBERS ---");

        seedOrUpdate("Shubham Sahu", "shubham@society.com", "9820147852", "RESIDENT", "A", "101", null);
        seedOrUpdate("Sameer Shaikh", "sameer@society.com", "9819325641", "RESIDENT", "A", "102", null);
        seedOrUpdate("Tanush", "tanush@society.com", "8767891234", "RESIDENT", "B", "201", null);
        seedOrUpdate("Harshal Tatkar", "harshal@society.com", "9833214567", "WORKER", "ALL", null, "Plumbing");
        seedOrUpdate("Daksh Tawde", "daksh@society.com", "8879654321", "WORKER", "ALL", null, "Electrical");

        System.out.println("--- DONE SEEDING USERS ---");
    }
}

