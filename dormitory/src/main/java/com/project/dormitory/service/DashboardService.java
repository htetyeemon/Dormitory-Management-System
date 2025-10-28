package com.project.dormitory.service;

import com.project.dormitory.model.*;
import com.project.dormitory.model.DashboardResponse;
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

    public DashboardResponse getStudentDashboard(Long studentId) {
        Student student = studentService.getStudentById(studentId);
        if (student == null) {
            return null;
        }

        Room room = student.getRoom();
        List<CheckInOut> recentActivities = checkInOutService.getRecentActivitiesByStudentId(studentId);
        List<ComplaintRepair> recentRequests = complaintRepairService.getRecentRequestsByStudentId(studentId);
        List<Announcement> announcements = announcementService.getRecentAnnouncements();

        return new DashboardResponse(room, recentActivities, recentRequests, announcements);
    }
}