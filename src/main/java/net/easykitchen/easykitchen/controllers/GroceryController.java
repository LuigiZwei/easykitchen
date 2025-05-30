package net.easykitchen.easykitchen.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.easykitchen.easykitchen.dtos.GroceryDto;
import net.easykitchen.easykitchen.entities.Grocery;
import net.easykitchen.easykitchen.mappers.GroceryMapper;

@RestController
@RequestMapping("/grocery")
public class GroceryController {
    private final GroceryMapper groceryMapper;

    public GroceryController(GroceryMapper groceryMapper) {
        this.groceryMapper = groceryMapper;
    }

    /*@GetMapping
    public GroceryDto groceryDto() {
        Grocery grocery = new Grocery();
        return groceryMapper.toDto(grocery);
    }*/

    @GetMapping("/{id}")
    public ResponseEntity<GroceryDto> getGrocery(@PathVariable int id) {
        Grocery grocery = new Grocery(id, "0000000000000", "Test Grocery", "Test Brand", "Test Category", 
                                        "https://example.com/image.jpg", 1.0f, "kg", 0.5f, "kg");
        if (grocery == null) {
            return ResponseEntity.notFound().build();
        } else {
            return ResponseEntity.ok(groceryMapper.toDto(grocery));
        }
    }
}
