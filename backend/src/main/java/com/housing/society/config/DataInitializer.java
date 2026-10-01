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
            if(users.findByEmail("admin@society.com").isEmpty()){
                users.save(new User(null,"Society Admin","admin@society.com",
                    encoder.encode("Admin@123"),"9999999999",User.Role.ADMIN,true));
                System.out.println("Default admin: admin@society.com / Admin@123");
            }
        };
    }
}