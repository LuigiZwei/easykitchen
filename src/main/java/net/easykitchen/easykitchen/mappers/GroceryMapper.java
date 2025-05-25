package net.easykitchen.easykitchen.mappers;

import org.mapstruct.Mapper;

import net.easykitchen.easykitchen.dtos.GroceryDto;
import net.easykitchen.easykitchen.entities.Grocery;

@Mapper(componentModel = "spring")
public interface GroceryMapper {
    GroceryDto toDto(Grocery grocery);
    Grocery toEntity(GroceryDto groceryDto);
}