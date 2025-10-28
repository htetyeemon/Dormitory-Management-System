package com.project.dormitory.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.dormitory.model.ComplaintRepair;

@Repository
public interface ComplaintRepairRepo extends JpaRepository<ComplaintRepair,Long> {

    List<ComplaintRepair> findByStudentId(Long studentId);

    List<ComplaintRepair> findTop5ByStudentIdOrderByDateTimeDesc(Long studentId);

}
