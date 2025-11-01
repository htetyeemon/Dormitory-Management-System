package com.project.dormitory.model;

import jakarta.persistence.*;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class DormitoryManager {
    @Id
    private Long id;

    private String name;
    private String phone;
    private String email;

    @JsonIgnore
    private String password;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name="dorm_id")
    @JsonIgnore
    private Dormitory dormitory;

    @OneToMany(mappedBy = "manager")
    @JsonIgnore
    private List<Announcement> announcements;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public List<Announcement> getAnnouncements() { return announcements; }
    public void setAnnouncements(List<Announcement> announcements) { this.announcements = announcements; }
}
