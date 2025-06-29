package net.easykitchen.easykitchen.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import net.easykitchen.easykitchen.Database;
import net.easykitchen.easykitchen.dtos.GroceryDto;
import net.easykitchen.easykitchen.entities.Grocery;
import net.easykitchen.easykitchen.mappers.GroceryMapper;

@RestController
@RequestMapping("/api/groceries")
public class GroceryController {
    private final GroceryMapper groceryMapper;

    public GroceryController(GroceryMapper groceryMapper) {
        this.groceryMapper = groceryMapper;
    }

    // Returns all groceries as DTOs
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

    // Returns a single grocery by id
    @GetMapping("/{id}")
    public ResponseEntity<GroceryDto> getGrocery(@PathVariable int id) {
        Grocery grocery = Database.loadGroceryById(id);
        if (grocery == null) {
            return ResponseEntity.notFound().build();
        } else {
            return ResponseEntity.ok(groceryMapper.toDto(grocery));
        }
    }

    // Adds a new grocery and returns the saved grocery (with generated id)
    @PostMapping("/add")
    public ResponseEntity<GroceryDto> addGrocery(@RequestBody GroceryDto groceryDto) {
        Grocery grocery = groceryMapper.toEntity(groceryDto);
        Grocery saved = Database.addGrocery(grocery); // Save and get entity with id
        GroceryDto savedDto = groceryMapper.toDto(saved);
        return ResponseEntity.ok(savedDto);
    }

    // Updates an existing grocery by id
    @PutMapping("/{id}")
    public ResponseEntity<GroceryDto> updateGrocery(@PathVariable int id, @RequestBody GroceryDto groceryDto) {
        Grocery grocery = groceryMapper.toEntity(groceryDto);
        grocery.setId(id);
        boolean updated = Database.updateGrocery(grocery);
        if (updated) {
            Grocery updatedGrocery = Database.loadGroceryById(id);
            return ResponseEntity.ok(groceryMapper.toDto(updatedGrocery));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Deletes a grocery by id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGrocery(@PathVariable int id) {
        boolean deleted = Database.deleteGroceryById(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}