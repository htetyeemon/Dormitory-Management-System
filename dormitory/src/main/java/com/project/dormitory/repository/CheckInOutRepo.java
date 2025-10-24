package com.project.dormitory.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.dormitory.model.CheckInOut;

public interface CheckInOutRepo extends JpaRepository<CheckInOut,Long>{

}
