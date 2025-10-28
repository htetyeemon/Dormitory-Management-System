package com.project.dormitory.service;

import org.springframework.stereotype.Service;

import com.project.dormitory.model.Student;
import com.project.dormitory.repository.StudentRepo;

@Service
public class StudentService {
    private final StudentRepo studentRepository;
    
    public StudentService(StudentRepo studentRepository) {
        this.studentRepository = studentRepository;
    }
    
    public Student getStudentById(Long id) {
        return studentRepository.findById(id).orElse(null);
    }

}
