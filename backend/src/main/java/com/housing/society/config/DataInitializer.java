package com.housing.society.config;

import com.housing.society.entity.User;
import com.housing.society.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    @Bean CommandLineRunner seedAdmin(UserRepository users, PasswordEncoder encoder){
        return args -> {
            var adminOpt = users.findByEmail("admin@society.com");
            if(adminOpt.isEmpty()){
                users.save(new User(null,"Society Admin","admin@society.com",
                    encoder.encode("Admin@123"),"9920112233",User.Role.ADMIN,true));
                System.out.println("Default admin: admin@society.com / Admin@123");
            } else {
                User admin = adminOpt.get();
                if ("9999999999".equals(admin.getPhone())) {
                    admin.setPhone("9920112233");
                    users.save(admin);
                    System.out.println("Updated admin phone to 9920112233");
                }
            }
        };
    }
}