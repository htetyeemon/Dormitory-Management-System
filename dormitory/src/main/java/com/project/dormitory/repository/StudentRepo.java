package com.project.dormitory.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.dormitory.model.Student;

@Repository
public interface StudentRepo extends JpaRepository<Student,Long> {

    List<Student> findByNameContaining(String name);
    
    List<Student> findByRoomDormitoryId(Long dormId);
    
    List<Student> findByRoomIsNull();

}
