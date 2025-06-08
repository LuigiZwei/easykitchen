package net.easykitchen.easykitchen.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
class PageController {

    @GetMapping("/")
    public String indexPage() {
        return "forward:/groceries.html";
    }

    @GetMapping("/groceries")
    public String groceriesPage() {
        return "forward:/groceries.html";
    }

    @GetMapping("/recipes")
    public String recipesPage() {
        return "forward:/recipes.html";
    }
}