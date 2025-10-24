package com.project.dormitory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.dormitory.model.Dormitory;

@Repository
public interface DormitoryRepo extends JpaRepository<Dormitory,Long> {

}
