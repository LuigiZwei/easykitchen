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

    private static void createGroceryTable() {
        String sql ="""
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

    /*(private static void rezepteTabelleErstellen() {
        String sql ="""
                    CREATE TABLE IF NOT EXISTS rezepte (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    rezeptname TEXT NOT NULL,
                    mengenangaben TEXT NOT NULL,
                    arbeitsbeschreibung TEXT,
                    arbeitszeit INT NOT NULL);
                    """;

        try (Connection conn = DriverManager.getConnection(DB_URL);
                Statement stmt = conn.createStatement()) {

            stmt.execute(sql);
        } catch (Exception e) {
            e.printStackTrace();
        }
    })*/

    private static void deleteTable(String name) {
        String sql = String.format("DROP TABLE IF EXISTS %s;", name);

        try (Connection conn = DriverManager.getConnection(DB_URL);
             Statement stmt = conn.createStatement()) {
    
            stmt.execute(sql);
            System.out.println("Deleted table: " + name);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void addGrocery(String gtin, String name, String brand, String category, String imageUrl, float amount, String unit, float drainedAmount, String drainedUnit) {
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

    private static List<Grocery> loadGroceries() {
        List<Grocery> groceries = new ArrayList<>();
    
        String sql = "SELECT * FROM groceries ORDER BY name";
    
        try (Connection conn = DriverManager.getConnection(DB_URL);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
    
            while (rs.next()) {
                Grocery p = new Grocery();
                p.setGtin(rs.getString("gtin"));
                p.setName(rs.getString("name"));
                p.setBrand(rs.getString("brand"));
                p.setCategory(rs.getString("category"));
                p.setImageUrl(rs.getString("imageUrl"));
                p.setAmount(rs.getFloat("amount"));
                p.setUnit(rs.getString("unit"));
                p.setDrainedAmount(rs.getFloat("drainedAmount"));
                p.setDrainedUnit(rs.getString("drainedUnit"));
                groceries.add(p);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return groceries;
    }
}
