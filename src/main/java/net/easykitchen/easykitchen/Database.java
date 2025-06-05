package net.easykitchen.easykitchen;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.List;

import net.easykitchen.easykitchen.entities.Grocery;

import java.util.ArrayList;

public class Database {

    private static final String DB_URL = "jdbc:sqlite:groceries.db";

    public static void createGroceryTable() {
        String sql = """
                CREATE TABLE IF NOT EXISTS groceries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                gtin TEXT,
                name TEXT,
                brand TEXT,
                category TEXT,
                imageUrl TEXT,
                amount FLOAT,
                unit TEXT,
                drainedAmount FLOAT,
                drainedUnit TEXT);
                """;

        try (Connection conn = DriverManager.getConnection(DB_URL);
                Statement stmt = conn.createStatement()) {

            stmt.execute(sql);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void deleteTable(String name) {
        // Only allow deletion of the groceries table
        if (!"groceries".equals(name)) {
            throw new IllegalArgumentException("Invalid table name");
        }
        String sql = "DROP TABLE IF EXISTS groceries;";
        try (Connection conn = DriverManager.getConnection(DB_URL);
             Statement stmt = conn.createStatement()) {
            stmt.execute(sql);
            System.out.println("Deleted table: " + name);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void addGrocery(String gtin, String name, String brand, String category, String imageUrl,
            float amount, String unit, float drainedAmount, String drainedUnit) {
        String sql = "INSERT INTO groceries (gtin, name, brand, category, imageUrl, amount, unit, drainedAmount, drainedUnit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DriverManager.getConnection(DB_URL);
                PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, gtin);
            pstmt.setString(2, name);
            pstmt.setString(3, brand);
            pstmt.setString(4, category);
            pstmt.setString(5, imageUrl);
            pstmt.setFloat(6, amount);
            pstmt.setString(7, unit);
            pstmt.setFloat(8, drainedAmount);
            pstmt.setString(9, drainedUnit);

            pstmt.executeUpdate();
            System.out.println("Added grocery: " + name);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static List<Grocery> loadGroceries() {
        List<Grocery> groceries = new ArrayList<>();

        String sql = "SELECT * FROM groceries ORDER BY name";

        try (Connection conn = DriverManager.getConnection(DB_URL);
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Grocery g = new Grocery();
                g.setId(rs.getInt("id"));
                g.setGtin(rs.getString("gtin"));
                g.setName(rs.getString("name"));
                g.setBrand(rs.getString("brand"));
                g.setCategory(rs.getString("category"));
                g.setImageUrl(rs.getString("imageUrl"));
                g.setAmount(rs.getFloat("amount"));
                g.setUnit(rs.getString("unit"));
                g.setDrainedAmount(rs.getFloat("drainedAmount"));
                g.setDrainedUnit(rs.getString("drainedUnit"));
                groceries.add(g);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return groceries;
    }

    public static Grocery loadGroceryById(int id) {
        String sql = "SELECT * FROM groceries WHERE id = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Grocery g = new Grocery();
                    g.setId(rs.getInt("id"));
                    g.setGtin(rs.getString("gtin"));
                    g.setName(rs.getString("name"));
                    g.setBrand(rs.getString("brand"));
                    g.setCategory(rs.getString("category"));
                    g.setImageUrl(rs.getString("imageUrl"));
                    g.setAmount(rs.getFloat("amount"));
                    g.setUnit(rs.getString("unit"));
                    g.setDrainedAmount(rs.getFloat("drainedAmount"));
                    g.setDrainedUnit(rs.getString("drainedUnit"));
                    return g;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
