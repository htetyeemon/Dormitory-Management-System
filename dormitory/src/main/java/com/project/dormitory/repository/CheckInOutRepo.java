package com.project.dormitory.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.dormitory.model.CheckInOut;

@Repository
public interface CheckInOutRepo extends JpaRepository<CheckInOut,Long>{

    List<CheckInOut> findByStudentId(Long studentId);

    List<CheckInOut> findTop5ByStudentIdOrderByDateDesc(Long studentId);

    List<CheckInOut> findByStudentRoomDormitoryIdOrderByDateDesc(Long dormId);
    
    List<CheckInOut> findByStatusOrderByDateDesc(String status);
    
    List<CheckInOut> findByStudentIdOrderByDateDesc(Long studentId);

    @Query("SELECT cio FROM CheckInOut cio JOIN cio.student s JOIN s.room r WHERE r.dormitory.id = :dormId ORDER BY cio.date DESC")
    List<CheckInOut> findByDormitoryId(@Param("dormId") Long dormId);


}
