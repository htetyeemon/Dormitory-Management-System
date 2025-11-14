package com.project.dormitory.controller;

import com.project.dormitory.model.*;
import com.project.dormitory.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "http://localhost:3000")
public class StudentController {

    private final StudentService studentService;
    private final RoomService roomService;
    private final CheckInOutService checkInOutService;
    private final ComplaintRepairService complaintRepairService;
    private final AnnouncementService announcementService;
    private final DashboardService dashboardService;

    public StudentController(StudentService studentService, RoomService roomService, 
                           CheckInOutService checkInOutService, ComplaintRepairService complaintRepairService,
                           AnnouncementService announcementService, DashboardService dashboardService) {
        this.studentService = studentService;
        this.roomService = roomService;
        this.checkInOutService = checkInOutService;
        this.complaintRepairService = complaintRepairService;
        this.announcementService = announcementService;
        this.dashboardService = dashboardService;
    }

    // Dashboard - Get student dashboard data
    @GetMapping("/{studentId}/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(@PathVariable Long studentId) {
        try {
            DashboardResponse dashboardData = dashboardService.getStudentDashboard(studentId);
            if (dashboardData != null) {
                return ResponseEntity.ok(dashboardData);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Room Information
    @GetMapping("/{studentId}/room")
    public ResponseEntity<RoomInfoResponse> getRoomInfo(@PathVariable Long studentId) {
        try {
            RoomInfoResponse roomInfo = roomService.getStudentRoomInfo(studentId);
            if (roomInfo != null) {
                return ResponseEntity.ok(roomInfo);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Service - Create complaint/repair request
    @PostMapping("/{studentId}/service/request")
    public ResponseEntity<ComplaintRepair> createServiceRequest(
            @PathVariable Long studentId,
            @RequestBody ComplaintRepair request) {
        try {
            ComplaintRepair createdRequest = complaintRepairService.createRequest(
                studentId, 
                request.getDescription(), 
                request.getServiceType(), 
                request.getPriorityLvl()
            );

            if (createdRequest != null) {
                return ResponseEntity.status(HttpStatus.CREATED).body(createdRequest);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Service - Get complaint/repair history
    @GetMapping("/{studentId}/service/history")
    public ResponseEntity<List<ComplaintRepair>> getServiceHistory(@PathVariable Long studentId) {
        try {
            List<ComplaintRepair> history = complaintRepairService.getRequestsByStudentId(studentId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // CheckInOut - Submit checkin/out form
    @PostMapping("/{studentId}/checkinout")
    public ResponseEntity<CheckInOut> submitCheckInOut(
            @PathVariable Long studentId,
            @RequestBody CheckInOut request) {
        try {
            CheckInOut createdRecord = checkInOutService.createCheckInOut(
                studentId, 
                request.getType(), 
                request.getDate()
            );

            if (createdRecord != null) {
                return ResponseEntity.status(HttpStatus.CREATED).body(createdRecord);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // CheckInOut - Get recent activities
    @GetMapping("/{studentId}/checkinout/history")
    public ResponseEntity<List<CheckInOut>> getCheckInOutHistory(@PathVariable Long studentId) {
        try {
            List<CheckInOut> history = checkInOutService.getActivitiesByStudentId(studentId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

   @GetMapping("/{studentId}/announcements")
    public ResponseEntity<List<Announcement>> getAllAnnouncements(@PathVariable Long studentId) {
        try {
            // Get student's room and dormitory
            RoomInfoResponse roomInfo = roomService.getStudentRoomInfo(studentId);
            if (roomInfo == null || roomInfo.getRoom() == null) {
                return ResponseEntity.ok(List.of()); // No room assigned, return empty list
            }
            
            Long dormId = roomInfo.getRoom().getDormitory().getId();
            List<Announcement> announcements = announcementService.getAllAnnouncementsByDormitory(dormId);
            return ResponseEntity.ok(announcements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{studentId}/announcements/dateAsc")
    public ResponseEntity<List<Announcement>> getAllAnnouncementsByAsc(@PathVariable Long studentId) {
        try {
            RoomInfoResponse roomInfo = roomService.getStudentRoomInfo(studentId);
            if (roomInfo == null || roomInfo.getRoom() == null) {
                return ResponseEntity.ok(List.of());
            }
            
            Long dormId = roomInfo.getRoom().getDormitory().getId();
            List<Announcement> announcements = announcementService.getAllAnnouncementsByDormitory(dormId);
            // Sort ascending by date
            announcements.sort(Comparator.comparing(Announcement::getDateTime));
            return ResponseEntity.ok(announcements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{studentId}/announcements/dateDesc")
    public ResponseEntity<List<Announcement>> getAllAnnouncementsByDesc(@PathVariable Long studentId) {
        try {
            RoomInfoResponse roomInfo = roomService.getStudentRoomInfo(studentId);
            if (roomInfo == null || roomInfo.getRoom() == null) {
                return ResponseEntity.ok(List.of());
            }
            
            Long dormId = roomInfo.getRoom().getDormitory().getId();
            List<Announcement> announcements = announcementService.getAllAnnouncementsByDormitory(dormId);
            // Sort descending by date (already done in repo, but ensure it)
            announcements.sort(Comparator.comparing(Announcement::getDateTime).reversed());
            return ResponseEntity.ok(announcements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}