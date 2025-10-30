package com.project.dormitory.service;

import java.util.List;

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

    public Long getStudentsByDormitoryCount(Long dormId) {
        return (long) studentRepository.findByRoomDormitoryId(dormId).size();
    }

    public List<Student> getStudentsByDormitory(Long dormId) {
        return studentRepository.findByRoomDormitoryId(dormId);
    }

    public List<Student> getStudentsWithoutRoom() {
        return studentRepository.findByRoomIsNull();
    }

    public List<Student> searchStudentsByName(String name) {
        return studentRepository.findByNameContaining(name);
    }
    
    public Student updateStudentRoom(Student student) {
        return studentRepository.save(student);
    }

}

    

