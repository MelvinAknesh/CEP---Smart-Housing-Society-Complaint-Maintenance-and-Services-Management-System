package com.housing.society;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SocietyApplication {
    public static void main(String[] args) {
        SpringApplication.run(SocietyApplication.class, args);
    }
}
