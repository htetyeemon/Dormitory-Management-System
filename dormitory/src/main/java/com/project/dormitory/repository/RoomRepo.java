package com.project.dormitory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.dormitory.model.Room;
import com.project.dormitory.model.RoomId;

@Repository
public interface RoomRepo extends JpaRepository<Room,RoomId> {

}
