package com.project.dormitory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.dormitory.model.DormitoryManager;

@Repository
public interface DormitoryManagerRepo extends JpaRepository<DormitoryManager,Long> {

}
