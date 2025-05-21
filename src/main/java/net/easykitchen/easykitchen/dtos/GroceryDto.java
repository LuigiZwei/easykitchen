package net.easykitchen.easykitchen.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class GroceryDto {
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

    public GroceryDto(int id) {
        this.id = id;
    }

    public GroceryDto() {
        
    }
}
