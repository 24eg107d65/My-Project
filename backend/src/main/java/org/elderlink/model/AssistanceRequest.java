package org.elderlink.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class AssistanceRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String category;
    private String details;
    private String location;
    private String requester;
    private String requesterName;
    private String scheduledFor;
    private String status;
    @Column(length = 500)
    private String declinedVolunteerIds = "";
    private boolean emergency;
    private Long volunteerId;
    private String volunteerName;
    private Integer rating;
    private String feedback;
    private LocalDateTime createdAt;

    public AssistanceRequest() {}

    public AssistanceRequest(String title, String category, String details, String location, String requester,
            String requesterName, String scheduledFor, String status, boolean emergency, Long volunteerId,
            String volunteerName, LocalDateTime createdAt) {
        this.title = title;
        this.category = category;
        this.details = details;
        this.location = location;
        this.requester = requester;
        this.requesterName = requesterName;
        this.scheduledFor = scheduledFor;
        this.status = status;
        this.emergency = emergency;
        this.volunteerId = volunteerId;
        this.volunteerName = volunteerName;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getCategory() { return category; }
    public String getDetails() { return details; }
    public String getLocation() { return location; }
    public String getRequester() { return requester; }
    public String getRequesterName() { return requesterName; }
    public String getScheduledFor() { return scheduledFor; }
    public String getStatus() { return status; }
    public boolean isEmergency() { return emergency; }
    public Long getVolunteerId() { return volunteerId; }
    public String getVolunteerName() { return volunteerName; }
    public Integer getRating() { return rating; }
    public String getFeedback() { return feedback; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getDeclinedVolunteerIds() { return declinedVolunteerIds; }
    public void setStatus(String status) { this.status = status; }
    public void setVolunteerId(Long volunteerId) { this.volunteerId = volunteerId; }
    public void setVolunteerName(String volunteerName) { this.volunteerName = volunteerName; }
    public void setRating(Integer rating) { this.rating = rating; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public void declineVolunteer(Long volunteerId) {
        String id = String.valueOf(volunteerId);
        if (declinedVolunteerIds == null || declinedVolunteerIds.isBlank()) declinedVolunteerIds = id;
        else if (java.util.Arrays.stream(declinedVolunteerIds.split(",")).noneMatch(id::equals)) {
            declinedVolunteerIds += "," + id;
        }
    }
    public boolean hasDeclinedVolunteer(Long volunteerId) {
        return declinedVolunteerIds != null && java.util.Arrays.stream(declinedVolunteerIds.split(","))
                .anyMatch(String.valueOf(volunteerId)::equals);
    }
    public void clearAssignment() {
        volunteerId = null;
        volunteerName = null;
    }
}