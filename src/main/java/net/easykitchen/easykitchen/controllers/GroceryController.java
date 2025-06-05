package net.easykitchen.easykitchen.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.easykitchen.easykitchen.Database;
import net.easykitchen.easykitchen.dtos.GroceryDto;
import net.easykitchen.easykitchen.entities.Grocery;
import net.easykitchen.easykitchen.mappers.GroceryMapper;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/grocery")
public class GroceryController {
    private final GroceryMapper groceryMapper;

    public GroceryController(GroceryMapper groceryMapper) {
        this.groceryMapper = groceryMapper;
    }

    @GetMapping("/all")
    public ResponseEntity<List<Grocery>> getAllGroceries() {
        List<Grocery> groceries = Database.loadGroceries();

        if (groceries == null) {
            return ResponseEntity.notFound().build();
        } else {
            return ResponseEntity.ok(groceries);
        }
    }

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

@PostMapping("/add")
public ResponseEntity<GroceryDto> addGrocery(@RequestBody GroceryDto groceryDto) {
    Grocery grocery = groceryMapper.toEntity(groceryDto);

    Database.addGrocery(
            grocery.getGtin(), grocery.getName(), grocery.getBrand(),
            grocery.getCategory(), grocery.getImageUrl(), grocery.getAmount(), grocery.getUnit(),
            grocery.getDrainedAmount(), grocery.getDrainedUnit());

    // Return the added grocery as JSON
    return ResponseEntity.ok(groceryDto);
}

}
