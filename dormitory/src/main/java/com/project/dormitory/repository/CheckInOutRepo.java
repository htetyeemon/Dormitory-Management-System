package com.project.dormitory.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.dormitory.model.CheckInOut;

@Repository
public interface CheckInOutRepo extends JpaRepository<CheckInOut,Long>{

    List<CheckInOut> findByStudentId(Long studentId);

    List<CheckInOut> findTop5ByStudentIdOrderByDateDesc(Long studentId);


}
