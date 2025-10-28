package com.project.dormitory.model;

import java.util.List;

public class DashboardResponse {
        private Room room;
        private List<CheckInOut> recentActivities;
        private List<ComplaintRepair> recentRequests;
        private List<Announcement> announcements;

        public DashboardResponse(Room room, List<CheckInOut> recentActivities, 
                               List<ComplaintRepair> recentRequests, List<Announcement> announcements) {
            this.room = room;
            this.recentActivities = recentActivities;
            this.recentRequests = recentRequests;
            this.announcements = announcements;
        }

        // Getters and setters
        public Room getRoom() { return room; }
        public void setRoom(Room room) { this.room = room; }
        public List<CheckInOut> getRecentActivities() { return recentActivities; }
        public void setRecentActivities(List<CheckInOut> recentActivities) { this.recentActivities = recentActivities; }
        public List<ComplaintRepair> getRecentRequests() { return recentRequests; }
        public void setRecentRequests(List<ComplaintRepair> recentRequests) { this.recentRequests = recentRequests; }
        public List<Announcement> getAnnouncements() { return announcements; }
        public void setAnnouncements(List<Announcement> announcements) { this.announcements = announcements; }
}