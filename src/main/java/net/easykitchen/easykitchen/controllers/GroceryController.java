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
    public ResponseEntity<List<GroceryDto>> getAllGroceries() {
        List<Grocery> groceries = Database.loadGroceries();
        if (groceries == null) {
            return ResponseEntity.notFound().build();
        } else {
            List<GroceryDto> dtos = groceries.stream()
                    .map(groceryMapper::toDto)
                    .toList();
            return ResponseEntity.ok(dtos);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroceryDto> getGrocery(@PathVariable int id) {
        Grocery grocery = Database.loadGroceryById(id); // You need to implement this method
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
        // Optionally reload the saved grocery with its ID and return it
        // Or return the DTO as is
        return ResponseEntity.ok(groceryDto);
    }

}
