package com.project.dormitory.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.dormitory.model.Room;
import com.project.dormitory.model.RoomId;

public interface RoomRepo extends JpaRepository<Room,RoomId> {

}
