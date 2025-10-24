package com.project.dormitory.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.dormitory.model.Dormitory;

public interface DormitoryRepo extends JpaRepository<Dormitory,Long> {

}
