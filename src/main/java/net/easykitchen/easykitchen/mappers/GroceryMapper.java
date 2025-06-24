package net.easykitchen.easykitchen.mappers;

import org.mapstruct.Mapper;

import net.easykitchen.easykitchen.dtos.GroceryDto;
import net.easykitchen.easykitchen.entities.Grocery;

@Mapper(componentModel = "spring")
public interface GroceryMapper {
    // Maps Grocery entity to GroceryDto
    GroceryDto toDto(Grocery grocery);

    // Maps GroceryDto to Grocery entity
    Grocery toEntity(GroceryDto groceryDto);
}