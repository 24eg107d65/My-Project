package org.elderlink.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Volunteer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(nullable = false, unique = true)
    private String email;
    private String passwordHash;
    private String phone;
    @Column(length = 1000)
    private String bio;
    @Column(length = 1000)
    private String interests;
    private String specialty;
    private String area;
    private double rating;
    private int completed;
    private int ratingCount;
    private boolean available;
    private boolean verified;

    public Volunteer() {}

    public Volunteer(String name, String email, String specialty, String area, double rating, int completed,
            boolean available, boolean verified) {
        this.name = name;
        this.email = email;
        this.specialty = specialty;
        this.area = area;
        this.rating = rating;
        this.completed = completed;
        this.available = available;
        this.verified = verified;
        this.ratingCount = completed;
    }

    public Volunteer(String name, String email, String passwordHash, String phone, String bio,
            String interests, String area) {
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.phone = phone;
        this.bio = bio;
        this.interests = interests;
        this.specialty = interests;
        this.area = area;
        this.available = true;
        this.verified = false;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getPhone() { return phone; }
    public String getBio() { return bio; }
    public String getInterests() { return interests; }
    public String getSpecialty() { return specialty; }
    public String getArea() { return area; }
    public double getRating() { return rating; }
    public int getCompleted() { return completed; }
    public boolean isAvailable() { return available; }
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    public void setAvailable(boolean available) { this.available = available; }
    public void recordRating(int score) {
        rating = (rating * ratingCount + score) / (ratingCount + 1);
        ratingCount++;
    }
    public void recordCompletion() {
        completed++;
    }
}