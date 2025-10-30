package com.project.dormitory.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.dormitory.model.ComplaintRepair;

@Repository
public interface ComplaintRepairRepo extends JpaRepository<ComplaintRepair,Long> {

    List<ComplaintRepair> findByStudentId(Long studentId);

    List<ComplaintRepair> findTop5ByStudentIdOrderByDateTimeDesc(Long studentId);

    List<ComplaintRepair> findByStudentRoomDormitoryIdOrderByDateTimeDesc(Long dormId);
    
    List<ComplaintRepair> findByStatusOrderByDateTimeDesc(String status);

    @Query("SELECT cr FROM ComplaintRepair cr JOIN cr.student s JOIN s.room r WHERE r.dormitory.id = :dormId ORDER BY cr.dateTime DESC")
    List<ComplaintRepair> findByDormitoryId(@Param("dormId") Long dormId);

}
