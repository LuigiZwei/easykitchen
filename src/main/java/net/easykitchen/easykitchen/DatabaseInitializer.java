package net.easykitchen.easykitchen;

import jakarta.annotation.PostConstruct;
import net.easykitchen.easykitchen.entities.Grocery;

import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer {

    @PostConstruct
    public void initDatabase() {
        Database.createGroceryTable();

        // Only add sample groceries if table is empty
        if (Database.loadGroceries().isEmpty()) {
            Database.addGrocery(
                new Grocery(12, "4001234567890", "Tomatensauce", "Hausmarke", "Konserven",
                    "https://www.alimentarium.org/sites/default/files/media/image/2016-10/AL001-02%20tomate_0.jpg",
                    400, "g", 240, "g")
            );
            Database.addGrocery(
                new Grocery(13, "4009876543210", "Mais", "GoldKorn", "Konserven",
                    "https://example.com/image2.jpg",
                    300, "g", 200, "g")
            );
        }
    }
}