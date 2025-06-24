package net.easykitchen.easykitchen;

import jakarta.annotation.PostConstruct;
import net.easykitchen.easykitchen.entities.Grocery;

import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer {

    // This method is called automatically after the Spring context is initialized
    @PostConstruct
    public void initDatabase() {
        Database.createGroceryTable();

        // Only add sample groceries if table is empty (for demo/testing)
        if (Database.loadGroceries().isEmpty()) {
            Database.addGrocery(
                    new Grocery(12, "4001234567890", "Tomatensauce", "Hausmarke", "Konserven",
                            "https://www.alimentarium.org/sites/default/files/media/image/2016-10/AL001-02%20tomate_0.jpg",
                            400, "g", 240, "g"));
            Database.addGrocery(
                    new Grocery(13, "4009876543210", "Mais", "GoldKorn", "Konserven",
                            "https://holtmann-saaten.de/wp-content/uploads/2024/04/Fotos-verkleinern-28-1.jpg",
                            300, "g", 200, "g"));
        }
    }
}