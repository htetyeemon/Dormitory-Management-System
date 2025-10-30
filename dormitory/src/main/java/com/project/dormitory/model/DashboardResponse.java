package com.project.dormitory.model;

import java.util.List;

public class DashboardResponse {
        private Room room;
        private List<ComplaintRepair> recentRequests;
        private List<Announcement> announcements;

        public DashboardResponse(Room room, 
                               List<ComplaintRepair> recentRequests, List<Announcement> announcements) {
            this.room = room;
            this.recentRequests = recentRequests;
            this.announcements = announcements;
        }

        // Getters and setters
        public Room getRoom() { return room; }
        public void setRoom(Room room) { this.room = room; }
        public List<ComplaintRepair> getRecentRequests() { return recentRequests; }
        public void setRecentRequests(List<ComplaintRepair> recentRequests) { this.recentRequests = recentRequests; }
        public List<Announcement> getAnnouncements() { return announcements; }
        public void setAnnouncements(List<Announcement> announcements) { this.announcements = announcements; }
}