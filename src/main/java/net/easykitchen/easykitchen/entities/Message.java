package net.easykitchen.easykitchen.entities;

public class Message {
    private String text;

    public Message() {
        // Leerer Konstruktor für die Serialisierung
    }

    public Message(String message) {
        this.text = message;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
