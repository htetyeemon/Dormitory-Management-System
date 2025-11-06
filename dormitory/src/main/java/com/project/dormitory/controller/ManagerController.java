package com.project.dormitory.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.dormitory.model.Announcement;
import com.project.dormitory.model.CheckInOut;
import com.project.dormitory.model.ComplaintRepair;
import com.project.dormitory.model.ManagerDashboardResponse;
import com.project.dormitory.model.Room;
import com.project.dormitory.model.RoomAssignmentRequest;
import com.project.dormitory.service.AnnouncementService;
import com.project.dormitory.service.CheckInOutService;
import com.project.dormitory.service.ComplaintRepairService;
import com.project.dormitory.service.ManagerDashboardService;
import com.project.dormitory.service.ManagerService;
import com.project.dormitory.service.RoomService;
import com.project.dormitory.service.StudentService;

@RestController
@RequestMapping("/api/manager")
@CrossOrigin(origins = "http://localhost:3000")
public class ManagerController {

    @Autowired
    private ManagerDashboardService managerDashboardService;

    @Autowired
    private RoomService roomService;

    @Autowired
    private CheckInOutService checkInOutService;

    @Autowired
    private ComplaintRepairService complaintRepairService;

    @Autowired
    private AnnouncementService announcementService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private ManagerService managerService;

    // Dashboard Endpoints
    @GetMapping("/{managerId}/dashboard")
    public ResponseEntity<?> getManagerDashboard(@PathVariable Long managerId) {
        try {
            ManagerDashboardResponse dashboardStats = managerDashboardService.getDashboardStats(managerId);
            
            return ResponseEntity.ok(dashboardStats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching dashboard data: " + e.getMessage());
        }
    }

    // Rooms Management Endpoints
    @GetMapping("/{managerId}/rooms")
    public ResponseEntity<?> getAllRooms(@PathVariable Long managerId) {
        try {
            Long dormId = managerService.getDormitoryIdByManagerId(managerId);
            List<Room> rooms = roomService.getRoomsByDormitory(dormId);
            return ResponseEntity.ok(rooms);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching rooms: " + e.getMessage());
        }
    }

    @PostMapping("/{managerId}/rooms/assign")
    public ResponseEntity<?> assignRoom(@PathVariable Long managerId, 
                                      @RequestBody RoomAssignmentRequest assignmentRequest) {
        try {
            Long dormId = managerService.getDormitoryIdByManagerId(managerId);
            roomService.assignRoomToStudent(assignmentRequest.getStudentId(), 
                                          assignmentRequest.getRoomNum(), dormId);
            return ResponseEntity.ok("Room assigned successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error assigning room: " + e.getMessage());
        }
    }

    @PutMapping("/{managerId}/rooms/reassign")
    public ResponseEntity<?> reassignRoom(@PathVariable Long managerId,
                                        @RequestBody RoomAssignmentRequest reassignmentRequest) {
        try {
            // First remove student from current room
            roomService.removeStudentFromRoom(reassignmentRequest.getStudentId());
            
            // Then assign to new room
            Long dormId = managerService.getDormitoryIdByManagerId(managerId);
            roomService.assignRoomToStudent(reassignmentRequest.getStudentId(),
                                          reassignmentRequest.getRoomNum(), dormId);
            return ResponseEntity.ok("Room reassigned successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error reassigning room: " + e.getMessage());
        }
    }

    @DeleteMapping("/{managerId}/rooms/remove-student/{studentId}")
    public ResponseEntity<?> removeStudentFromRoom(@PathVariable Long managerId,
                                                 @PathVariable Long studentId) {
        try {
            roomService.removeStudentFromRoom(studentId);
            return ResponseEntity.ok("Student removed from room successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error removing student from room: " + e.getMessage());
        }
    }

    @GetMapping("/{managerId}/rooms/search")
    public ResponseEntity<?> searchRooms(@PathVariable Long managerId,
                                       @RequestParam String searchTerm) {
        try {
            Long dormId = managerService.getDormitoryIdByManagerId(managerId);
            Room room = roomService.searchRoom(searchTerm, dormId);
            return ResponseEntity.ok(room != null ? room : "No room found");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error searching room: " + e.getMessage());
        }
    }

    // Check-in/Check-out Management Endpoints
    @GetMapping("/{managerId}/checkinout")
    public ResponseEntity<?> getAllCheckInOutRequests(@PathVariable Long managerId) {
        try {
            Long dormId = managerService.getDormitoryIdByManagerId(managerId);
            List<CheckInOut> requests = checkInOutService.getCheckInOutRequests(dormId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching check-in/out requests: " + e.getMessage());
        }
    }

    @GetMapping("/{managerId}/checkinout/pending")
    public ResponseEntity<?> getPendingCheckInOutRequests(@PathVariable Long managerId) {
        try {
            List<CheckInOut> pendingRequests = checkInOutService.getPendingRequests();
            return ResponseEntity.ok(pendingRequests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching pending requests: " + e.getMessage());
        }
    }

    @PostMapping("/{managerId}/checkinout/{requestId}/approve")
    public ResponseEntity<?> approveCheckInOutRequest(@PathVariable Long managerId,
                                                    @PathVariable Long requestId) {
        try {
            checkInOutService.approveRequest(requestId);
            return ResponseEntity.ok("Request approved successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error approving request: " + e.getMessage());
        }
    }

    @PostMapping("/{managerId}/checkinout/{requestId}/reject")
    public ResponseEntity<?> rejectCheckInOutRequest(@PathVariable Long managerId,
                                                   @PathVariable Long requestId) {
        try {
            checkInOutService.rejectRequest(requestId);
            return ResponseEntity.ok("Request rejected successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error rejecting request: " + e.getMessage());
        }
    }

    // Complaints Management Endpoints
    @GetMapping("/{managerId}/complaints")
    public ResponseEntity<?> getAllComplaints(@PathVariable Long managerId) {
        try {
            Long dormId = managerService.getDormitoryIdByManagerId(managerId);
            List<ComplaintRepair> complaints = complaintRepairService.getComplaintsByDormitory(dormId);
            return ResponseEntity.ok(complaints);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching complaints: " + e.getMessage());
        }
    }

    @GetMapping("/{managerId}/complaints/pending")
    public ResponseEntity<?> getPendingComplaints(@PathVariable Long managerId) {
        try {
            List<ComplaintRepair> pendingComplaints = complaintRepairService.getPendingComplaints();
            return ResponseEntity.ok(pendingComplaints);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching pending complaints: " + e.getMessage());
        }
    }

    @PutMapping("/{managerId}/complaints/{complaintId}/status")
    public ResponseEntity<?> updateComplaintStatus(@PathVariable Long managerId,
                                                 @PathVariable Long complaintId) {
        try {
            complaintRepairService.updateComplaintStatus(complaintId, "APPROVED");
            return ResponseEntity.ok("Complaint status updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating complaint status: " + e.getMessage());
        }
    }

    @GetMapping("/{managerId}/announcements")
public ResponseEntity<?> getAllAnnouncements(@PathVariable Long managerId) {
    try {
        List<Announcement> announcements = announcementService.getAllAnnouncementsByManager(managerId);
        return ResponseEntity.ok(announcements);
    } catch (Exception e) {
        return ResponseEntity.badRequest().body("Error fetching announcements: " + e.getMessage());
    }
}

// Search announcements without pagination
@GetMapping("/{managerId}/announcements/search")
public ResponseEntity<?> searchAnnouncements(@PathVariable Long managerId,
                                           @RequestParam String keyword) {
    try {
        List<Announcement> announcements = announcementService.searchAnnouncementsByTitle(managerId, keyword);
        return ResponseEntity.ok(announcements);
    } catch (Exception e) {
        return ResponseEntity.badRequest().body("Error searching announcements: " + e.getMessage());
    }
}

    @PostMapping("/{managerId}/announcements")
    public ResponseEntity<?> createAnnouncement(@PathVariable Long managerId,
                                              @RequestBody Announcement announcement) {
        try {
            Announcement createdAnnouncement = announcementService.createAnnouncement(managerId, announcement);
            return ResponseEntity.ok(createdAnnouncement);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating announcement: " + e.getMessage());
        }
    }

    @PutMapping("/{managerId}/announcements/{announcementId}")
    public ResponseEntity<?> updateAnnouncement(@PathVariable Long managerId,
                                              @PathVariable Long announcementId,
                                              @RequestBody Announcement announcementDetails) {
        try {
            Announcement updatedAnnouncement = announcementService.updateAnnouncement(announcementId, announcementDetails);
            return ResponseEntity.ok(updatedAnnouncement);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating announcement: " + e.getMessage());
        }
    }

    @DeleteMapping("/{managerId}/announcements/{announcementId}")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable Long managerId,
                                              @PathVariable Long announcementId) {
        try {
            announcementService.deleteAnnouncement(announcementId);
            return ResponseEntity.ok("Announcement deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting announcement: " + e.getMessage());
        }
    }
    

}
