package net.easykitchen.easykitchen.entities;

public class Grocery {
    private int id;
    private int gtin;
    private String name;
    private String brand;
    private String category;
    private String imageUrl;
    private float amount;
    private String unit;
    private float drainedAmount;
    private String drainedUnit;

    public Grocery() {
        // Leerer Konstruktor für die Serialisierung
    }

    public Grocery(int id, int gtin, String name, String brand, String category, String imageUrl, float amount,
            String unit, float drainedAmount, String drainedUnit) {
        this.id = id;
        this.gtin = gtin;
        this.name = name;
        this.brand = brand;
        this.category = category;
        this.imageUrl = imageUrl;
        this.amount = amount;
        this.unit = unit;
        this.drainedAmount = drainedAmount;
        this.drainedUnit = drainedUnit;
    }

    public int getId() {
        return id;
    }

    public int getGtin() {
        return gtin;
    }

    public String getName() {
        return name;
    }

    public String getBrand() {
        return brand;
    }

    public String getCategory() {
        return category;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public float getAmount() {
        return amount;
    }

    public String getUnit() {
        return unit;
    }

    public float getDrainedAmount() {
        return drainedAmount;
    }

    public String getDrainedUnit() {
        return drainedUnit;
    }
}