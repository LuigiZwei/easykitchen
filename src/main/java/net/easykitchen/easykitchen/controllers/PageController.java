package net.easykitchen.easykitchen.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
class PageController {

    // Redirects root URL to groceries.html
    @GetMapping("/")
    public String indexPage() {
        return "forward:/groceries.html";
    }

    // Handles /groceries URL and serves groceries.html
    @GetMapping("/groceries")
    public String groceriesPage() {
        return "forward:/groceries.html";
    }

    // Handles /recipes URL and serves recipes.html
    @GetMapping("/recipes")
    public String recipesPage() {
        return "forward:/recipes.html";
    }
}