package net.easykitchen.easykitchen.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
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

    // Constructor for DTO with only id (can be used for delete operations)
    public GroceryDto(int id) {
        this.id = id;
    }
}
