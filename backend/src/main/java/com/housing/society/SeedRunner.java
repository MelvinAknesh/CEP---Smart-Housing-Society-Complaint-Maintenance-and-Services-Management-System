package com.housing.society;

import com.housing.society.dto.AuthDtos.RegisterRequest;
import com.housing.society.service.AuthService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class SeedRunner implements CommandLineRunner {
    private final AuthService authService;

    public SeedRunner(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("--- SEEDING 5 USERS ---");
        
        try {
            authService.register(new RegisterRequest(
                "Shubham Sahu", "shubham@society.com", "9876543210", "Society@123", "RESIDENT", "A", "101", null, null, null, null
            ));
            System.out.println("Registered Shubham");
        } catch (Exception e) { System.out.println(e.getMessage()); }

        try {
            authService.register(new RegisterRequest(
                "Sameer Shaikh", "sameer@society.com", "9876543211", "Society@123", "RESIDENT", "A", "102", null, null, null, null
            ));
            System.out.println("Registered Sameer");
        } catch (Exception e) { System.out.println(e.getMessage()); }

        try {
            authService.register(new RegisterRequest(
                "Tanush", "tanush@society.com", "9876543212", "Society@123", "RESIDENT", "B", "201", null, null, null, null
            ));
            System.out.println("Registered Tanush");
        } catch (Exception e) { System.out.println(e.getMessage()); }

        try {
            authService.register(new RegisterRequest(
                "Harshal Tatkar", "harshal@society.com", "9876543213", "Society@123", "WORKER", "ALL", null, null, null, null, "Plumbing"
            ));
            System.out.println("Registered Harshal");
        } catch (Exception e) { System.out.println(e.getMessage()); }

        try {
            authService.register(new RegisterRequest(
                "Daksh Tawde", "daksh@society.com", "9876543214", "Society@123", "WORKER", "ALL", null, null, null, null, "Electrical"
            ));
            System.out.println("Registered Daksh");
        } catch (Exception e) { System.out.println(e.getMessage()); }
        
        System.out.println("--- DONE SEEDING USERS ---");
    }
}
