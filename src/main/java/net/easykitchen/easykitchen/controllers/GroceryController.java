package net.easykitchen.easykitchen.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.AllArgsConstructor;
import net.easykitchen.easykitchen.entities.Grocery;

@RestController
@AllArgsConstructor
public class GroceryController {
    @GetMapping("/grocery")
    public Grocery grocery() {
        return new Grocery();
    }
}
