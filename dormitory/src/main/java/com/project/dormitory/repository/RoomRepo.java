package com.project.dormitory.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.dormitory.model.Room;
import com.project.dormitory.model.RoomId;

@Repository
public interface RoomRepo extends JpaRepository<Room,RoomId> {
    List<Room> findByDormitoryId(Long dormId);
    
    List<Room> findByDormitoryIdAndOccupacyLessThan(Long dormId, Integer occupancy);
    
    List<Room> findByDormitoryIdAndRoomNumContaining(Long dormId, String roomNum);

    @Query("SELECT r FROM Room r JOIN r.students s WHERE s.id = :studentId")
    Optional<Room> findByStudentId(@Param("studentId") Long studentId);
}
