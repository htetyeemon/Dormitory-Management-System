package com.project.dormitory.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.project.dormitory.model.CheckInOut;
import com.project.dormitory.model.Student;
import com.project.dormitory.repository.CheckInOutRepo;
import com.project.dormitory.repository.StudentRepo;

@Service
public class CheckInOutService {
    private final CheckInOutRepo checkInOutRepository;
    private final StudentRepo studentRepository;
    
    public CheckInOutService(CheckInOutRepo checkInOutRepository, StudentRepo studentRepository) {
        this.checkInOutRepository = checkInOutRepository;
        this.studentRepository = studentRepository;
    }
    
    public List<CheckInOut> getActivitiesByStudentId(Long studentId) {
        return checkInOutRepository.findByStudentId(studentId);
    }
    
    public List<CheckInOut> getRecentActivitiesByStudentId(Long studentId) {
        // Get recent activities (last 10 or based on date)
        return checkInOutRepository.findTop5ByStudentIdOrderByDateDesc(studentId);
    }
    
    public CheckInOut createCheckInOut(Long studentId, String type, LocalDate date) {
        Student student = studentRepository.findById(studentId).orElse(null);
        if (student != null) {
            CheckInOut checkInOut = new CheckInOut();
            checkInOut.setStudent(student);
            checkInOut.setType(type);
            checkInOut.setDate(date);
            return checkInOutRepository.save(checkInOut);
        }
        return null;
    }

}
