package net.easykitchen.easykitchen.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.easykitchen.easykitchen.entities.Grocery;

@RestController
public class GroceryController {
    @RequestMapping("/grocery")
    public Grocery grocery() {
        return new Grocery();
    }
}
