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

    // Save the database in the "data" folder in your project directory
    private static final String DB_URL = "jdbc:sqlite:data/groceries.db";

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
        // Only allow deletion of the groceries table for safety
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

    // Add grocery and return the saved grocery with generated id
    public static Grocery addGrocery(Grocery grocery) {
        String sql = "INSERT INTO groceries (gtin, name, brand, category, imageUrl, amount, unit, drainedAmount, drainedUnit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DriverManager.getConnection(DB_URL);
                PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setString(1, grocery.getGtin());
            pstmt.setString(2, grocery.getName());
            pstmt.setString(3, grocery.getBrand());
            pstmt.setString(4, grocery.getCategory());
            pstmt.setString(5, grocery.getImageUrl());
            pstmt.setFloat(6, grocery.getAmount());
            pstmt.setString(7, grocery.getUnit());
            pstmt.setFloat(8, grocery.getDrainedAmount());
            pstmt.setString(9, grocery.getDrainedUnit());

            pstmt.executeUpdate();

            // Retrieve the generated id and return the full Grocery object
            try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    int id = generatedKeys.getInt(1);
                    return loadGroceryById(id);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    // Update grocery by id, returns true if updated
    public static boolean updateGrocery(Grocery grocery) {
        String sql = "UPDATE groceries SET gtin = ?, name = ?, brand = ?, category = ?, imageUrl = ?, amount = ?, unit = ?, drainedAmount = ?, drainedUnit = ? WHERE id = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL);
                PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, grocery.getGtin());
            pstmt.setString(2, grocery.getName());
            pstmt.setString(3, grocery.getBrand());
            pstmt.setString(4, grocery.getCategory());
            pstmt.setString(5, grocery.getImageUrl());
            pstmt.setFloat(6, grocery.getAmount());
            pstmt.setString(7, grocery.getUnit());
            pstmt.setFloat(8, grocery.getDrainedAmount());
            pstmt.setString(9, grocery.getDrainedUnit());
            pstmt.setInt(10, grocery.getId());

            int rowsUpdated = pstmt.executeUpdate();
            return rowsUpdated > 0;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    // Delete grocery by id, returns true if deleted
    public static boolean deleteGroceryById(int id) {
        String sql = "DELETE FROM groceries WHERE id = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL);
                PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);
            int rowsDeleted = pstmt.executeUpdate();
            return rowsDeleted > 0;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    // Load all groceries from the database, sorted by name
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

    // Load a single grocery by its id
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
