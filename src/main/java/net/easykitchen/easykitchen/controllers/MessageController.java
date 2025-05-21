package net.easykitchen.easykitchen.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import net.easykitchen.easykitchen.entities.Message;

@RestController
public class MessageController {
    @GetMapping("/hello")
    public Message sayHello() {
        return new Message("Hello World");
    }
}
