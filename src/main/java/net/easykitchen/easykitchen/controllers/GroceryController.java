package net.easykitchen.easykitchen.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    /*
     * @GetMapping
     * public GroceryDto groceryDto() {
     * Grocery grocery = new Grocery();
     * return groceryMapper.toDto(grocery);
     * }
     */

    @GetMapping("/all")
    public ResponseEntity<List<Grocery>> getAllGroceries() {
        List<Grocery> groceries = List.of(
                new Grocery(1, "0000000000000", "Test Grocery 1", "Test Brand 1", "Test Category 1",
                        "https://www.matthiasklenk.de/fileadmin/seo-glossar/url-top-level-domain-verzeichnis-pfad.png",
                        1.0f, "kg", 0.5f, "kg"),
                new Grocery(2, "0000000000001", "Test Grocery 2", "Test Brand 2", "Test Category 2",
                        "https://jurenergie.de/wp-content/uploads/2024/04/Bild1.jpg", 2.0f, "kg", 1.0f, "kg"),
                new Grocery(3, "0000000000002", "Test Grocery 3", "Test Brand 2", "Test Category 2",
                        "https://img.mittelbayerische.de/ezplatform/images/6/1/8/7/331567816-1-ger-DE/b4e272a6d123-29-114158943.jpg",
                        2.0f, "kg", 1.0f, "kg"));

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

    @PostMapping("")
    public String postMethodName(@RequestBody String entity) {
        // TODO: process POST request

        return entity;
    }

}
