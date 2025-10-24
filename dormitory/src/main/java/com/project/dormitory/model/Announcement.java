package com.project.dormitory.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private LocalDateTime dateTime;

    @ManyToOne
    @JoinColumn(name = "mgr_id")
    private DormitoryManager manager;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }

    public DormitoryManager getManager() { return manager; }
    public void setManager(DormitoryManager manager) { this.manager = manager; }
}
