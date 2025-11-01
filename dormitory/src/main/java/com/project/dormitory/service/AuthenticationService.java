package com.project.dormitory.service;

import org.springframework.stereotype.Service;


import org.springframework.beans.factory.annotation.Autowired;
import com.project.dormitory.model.*;
import com.project.dormitory.repository.DormitoryManagerRepo;
import com.project.dormitory.repository.StudentRepo;

@Service
public class AuthenticationService {

    @Autowired
    private StudentRepo studentRepository;

    @Autowired
    private DormitoryManagerRepo managerRepository;

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        try {
            if ("student".equalsIgnoreCase(request.getUserType())) {
                return authenticateStudent(request);
            } else if ("manager".equalsIgnoreCase(request.getUserType())) {
                return authenticateManager(request);
            } else {
                return new AuthenticationResponse(false, "Invalid user type");
            }
        } catch (Exception e) {
            return new AuthenticationResponse(false, "Authentication failed: " + e.getMessage());
        }
    }

    private AuthenticationResponse authenticateStudent(AuthenticationRequest request) {
        Student student = studentRepository.findById(request.getId()).orElse(null);
        
        if (student == null) {
            return new AuthenticationResponse(false, "Student not found");
        }
        
        // For now, using plain text comparison. In production, use password encoding!
        if (student.getPassword() != null && student.getPassword().equals(request.getPassword())) {
            return new AuthenticationResponse(true, "Login successful", 
                    student.getId(), "student", student.getName(), student.getEmail());
        } else {
            return new AuthenticationResponse(false, "Invalid password");
        }
    }

    private AuthenticationResponse authenticateManager(AuthenticationRequest request) {
        DormitoryManager manager = managerRepository.findById(request.getId()).orElse(null);
        
        if (manager == null) {
            return new AuthenticationResponse(false, "Manager not found");
        }
        
        // For now, using plain text comparison. In production, use password encoding!
        if (manager.getPassword() != null && manager.getPassword().equals(request.getPassword())) {
            return new AuthenticationResponse(true, "Login successful", 
                    manager.getId(), "manager", manager.getName(), manager.getEmail());
        } else {
            return new AuthenticationResponse(false, "Invalid password");
        }
    }
}
