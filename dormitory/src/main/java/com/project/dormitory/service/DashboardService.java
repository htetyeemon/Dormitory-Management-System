package com.project.dormitory.service;

import com.project.dormitory.model.*;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {
    
    private final StudentService studentService;
    private final CheckInOutService checkInOutService;
    private final ComplaintRepairService complaintRepairService;
    private final AnnouncementService announcementService;

    public DashboardService(StudentService studentService, CheckInOutService checkInOutService,
                           ComplaintRepairService complaintRepairService, AnnouncementService announcementService) {
        this.studentService = studentService;
        this.checkInOutService = checkInOutService;
        this.complaintRepairService = complaintRepairService;
        this.announcementService = announcementService;
    }

    public DashboardResponse getStudentDashboard(long studentId) {
        Student student = studentService.getStudentById(studentId);
        if (student == null) {
            return null;
        }

        Room room = student.getRoom();
        List<ComplaintRepair> recentRequests = complaintRepairService.getRecentRequestsByStudentId(studentId);
        
        // Get announcements for student's dormitory
        List<Announcement> recentAnnouncements = List.of();
        if (room != null && room.getDormitory() != null) {
            recentAnnouncements = announcementService.getRecentAnnouncementsByDormitory(room.getDormitory().getId());
        }

        return new DashboardResponse(room, recentRequests, recentAnnouncements);
    }
}