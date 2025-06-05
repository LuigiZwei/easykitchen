package net.easykitchen.easykitchen;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the EasyKitchen Spring Boot application.
 */
@SpringBootApplication
public class EasykitchenApplication {

    public static void main(String[] args) {
        SpringApplication.run(EasykitchenApplication.class, args);
        System.out.println("EasyKitchen application started!");
    }
}