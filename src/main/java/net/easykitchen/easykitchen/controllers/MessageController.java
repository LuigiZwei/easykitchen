package net.easykitchen.easykitchen.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.easykitchen.easykitchen.entities.Message;

@RestController
public class MessageController {
    @RequestMapping("/hello")
    public Message sayHello() {
        return new Message("Hello World");
    }
}
