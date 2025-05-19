package net.easykitchen.easykitchen;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {
    @Value("${spring.application.name}")
    private String appName;

    @GetMapping("/testapi")
    public String testApi() {
        return "Test erfolgreich! 🚀";
    }

    /*@GetMapping("/")
    public String index() {
        return "index";
    }*/
}
