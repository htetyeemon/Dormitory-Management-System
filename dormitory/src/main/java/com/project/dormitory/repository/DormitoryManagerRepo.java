package com.project.dormitory.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.dormitory.model.DormitoryManager;

public interface DormitoryManagerRepo extends JpaRepository<DormitoryManager,Long> {

}
