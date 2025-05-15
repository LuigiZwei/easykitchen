package net.easykitchen.easykitchen;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ApiController {

    @GetMapping("/testapi")
    public String testApi() {
        return "Test erfolgreich! 🚀";
    }

    @GetMapping("/")
    public String index() {
        return "Hallo Welt! 🌍";
    }
}
