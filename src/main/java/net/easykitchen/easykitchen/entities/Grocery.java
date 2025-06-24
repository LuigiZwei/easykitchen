package net.easykitchen.easykitchen.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Grocery {
    private int id;
    private String gtin;
    private String name;
    private String brand;
    private String category;
    private String imageUrl;
    private float amount;
    private String unit;
    private float drainedAmount;
    private String drainedUnit;

    // Constructor for entity with only id
    public Grocery(int id) {
        this.id = id;
    }
}