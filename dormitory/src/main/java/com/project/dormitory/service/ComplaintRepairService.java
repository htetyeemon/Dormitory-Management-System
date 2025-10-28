package com.project.dormitory.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.project.dormitory.model.ComplaintRepair;
import com.project.dormitory.model.Student;
import com.project.dormitory.repository.ComplaintRepairRepo;
import com.project.dormitory.repository.StudentRepo;

@Service
public class ComplaintRepairService {
    private final ComplaintRepairRepo complaintRepairRepository;
    private final StudentRepo studentRepository;
    
    public ComplaintRepairService(ComplaintRepairRepo complaintRepairRepository, 
                                StudentRepo studentRepository) {
        this.complaintRepairRepository = complaintRepairRepository;
        this.studentRepository = studentRepository;
    }
    
    public List<ComplaintRepair> getRequestsByStudentId(Long studentId) {
        return complaintRepairRepository.findByStudentId(studentId);
    }
    
    public List<ComplaintRepair> getRecentRequestsByStudentId(Long studentId) {
        // Get recent requests (last 10 or based on date)
        return complaintRepairRepository.findTop5ByStudentIdOrderByDateTimeDesc(studentId);
    }
    
    public ComplaintRepair createRequest(Long studentId, String description, String serviceType, String priorityLvl) {
        Student student = studentRepository.findById(studentId).orElse(null);
        if (student != null) {
            ComplaintRepair complaintRepair = new ComplaintRepair();
            complaintRepair.setDescription(description);
            complaintRepair.setServiceType(serviceType);
            complaintRepair.setDateTime(LocalDateTime.now());
            complaintRepair.setPriorityLvl(priorityLvl);
            complaintRepair.setStatus("Pending");
            complaintRepair.setStudent(student);
            
            return complaintRepairRepository.save(complaintRepair);
        }
        return null;
    }


}
