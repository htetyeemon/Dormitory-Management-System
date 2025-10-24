package com.project.dormitory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.dormitory.model.CheckInOut;

@Repository
public interface CheckInOutRepo extends JpaRepository<CheckInOut,Long>{

}
