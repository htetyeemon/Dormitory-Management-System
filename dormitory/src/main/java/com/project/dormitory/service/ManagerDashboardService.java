package com.project.dormitory.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.dormitory.model.Announcement;
import com.project.dormitory.model.ManagerDashboardResponse;

@Service
public class ManagerDashboardService {

    @Autowired
    private StudentService studentService;
    
    @Autowired
    private RoomService roomService;
    
    @Autowired
    private CheckInOutService checkInOutService;
    
    @Autowired
    private ComplaintRepairService complaintRepairService;
    
    @Autowired
    private AnnouncementService announcementService;
    
    @Autowired
    private ManagerService dormitoryManagerService;
    
    public ManagerDashboardResponse getDashboardStats(Long managerId) {
        Long dormId = dormitoryManagerService.getDormitoryIdByManagerId(managerId);
        
        // Using constructor
        return new ManagerDashboardResponse(
            
            studentService.getStudentsByDormitoryCount(dormId),
            roomService.getAvailableRoomsCount(dormId),
            checkInOutService.getPendingRequestsCount(),
            complaintRepairService.getPendingComplaintsCount(),
            announcementService.getRecentAnnouncementsByManager(managerId)
            
        );
    }
    public List<Announcement> getRecentActivities(Long managerId) {
        List<Announcement> allAnnouncements = announcementService.getAllAnnouncementsByManager(managerId);
        return allAnnouncements.stream()
            .limit(4)
            .collect(java.util.stream.Collectors.toList());
    }

}
