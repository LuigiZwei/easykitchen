package net.easykitchen.easykitchen;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

@SpringBootApplication
public class EasykitchenApplication {

    public static void main(String[] args) {
        SpringApplication.run(EasykitchenApplication.class, args);
        printUsers();
    }

    private static void printUsers() {
        String url = "jdbc:sqlite:./your-database-file.db"; // Pfad zur SQLite-Datei anpassen
        String sql = "SELECT id, name FROM users"; // Beispiel-Tabelle und Spaltennamen

        try (Connection conn = DriverManager.getConnection(url);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                System.out.println("ID: " + rs.getInt("id") + ", Name: " + rs.getString("name"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}