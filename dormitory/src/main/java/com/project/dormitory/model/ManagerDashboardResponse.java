package com.project.dormitory.model;

import java.util.List;

public class ManagerDashboardResponse {

    private Long totalStudents;
    private Long availableRooms;
    private Long pendingCheckIns;
    private Long activeComplaints;
    private List<Announcement> announcements;
    
    // Default constructor
    public ManagerDashboardResponse() {}
    
    // All-args constructor
    public ManagerDashboardResponse(Long totalStudents, Long availableRooms, Long pendingCheckIns, Long activeComplaints,List<Announcement> announcements) {
        this.totalStudents = totalStudents;
        this.availableRooms = availableRooms;
        this.pendingCheckIns = pendingCheckIns;
        this.activeComplaints = activeComplaints;
        this.announcements = announcements;
    }
    
    public List<Announcement> getAnnouncements() {
        return announcements;
    }

    public void setAnnouncements(List<Announcement> announcements) {
        this.announcements = announcements;
    }

    // Getters and Setters
    public Long getTotalStudents() {
        return totalStudents;
    }
    
    public void setTotalStudents(Long totalStudents) {
        this.totalStudents = totalStudents;
    }
    
    public Long getAvailableRooms() {
        return availableRooms;
    }
    
    public void setAvailableRooms(Long availableRooms) {
        this.availableRooms = availableRooms;
    }
    
    public Long getPendingCheckIns() {
        return pendingCheckIns;
    }
    
    public void setPendingCheckIns(Long pendingCheckIns) {
        this.pendingCheckIns = pendingCheckIns;
    }
    
    public Long getActiveComplaints() {
        return activeComplaints;
    }
    
    public void setActiveComplaints(Long activeComplaints) {
        this.activeComplaints = activeComplaints;
    }

}
