package com.project.dormitory.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.dormitory.model.Student;

public interface StudentRepo extends JpaRepository<Student,Long> {

}
