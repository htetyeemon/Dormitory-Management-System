package com.project.dormitory.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.dormitory.model.Room;
import com.project.dormitory.model.RoomInfoResponse;
import com.project.dormitory.model.Student;
import com.project.dormitory.repository.RoomRepo;
import com.project.dormitory.repository.StudentRepo;

@Service
public class RoomService {
    private final StudentRepo studentRepository;

    private final RoomRepo roomRepository;

    public RoomService(StudentRepo studentRepository,RoomRepo roomRepository) {
        this.studentRepository = studentRepository;
        this.roomRepository = roomRepository;
    }

    public RoomInfoResponse getStudentRoomInfo(Long studentId) {
        Student student = studentRepository.findById(studentId).orElse(null);
        if (student == null) {
            return null;
        }

        Room room = student.getRoom();
        Student roommate = student.getRoommate();
        
        return new RoomInfoResponse(room, roommate);
    }

    public Long getAvailableRoomsCount(Long dormId) {
    return (long) roomRepository.findByDormitoryIdAndOccupacyLessThan(dormId, 2).size();
}
    public List<Room> getRoomsByDormitory(Long dormId) {
        return roomRepository.findByDormitoryId(dormId);
    }
    
    @Transactional
    public void assignRoomToStudent(Long studentId, String roomNum, Long dormId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));
        
        Room room = roomRepository.findById(new com.project.dormitory.model.RoomId(roomNum, dormId))
            .orElseThrow(() -> new RuntimeException("Room not found"));
        
        if (room.getOccupancy() >= 2) {
            throw new RuntimeException("Room is already full");
        }
        
        student.setRoom(room);
        room.setOccupancy(room.getOccupancy() + 1);
        
        studentRepository.save(student);
        roomRepository.save(room);
    }
    
    @Transactional
    public void removeStudentFromRoom(Long studentId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));
        
        Room room = student.getRoom();
        if (room != null) {
            room.setOccupancy(room.getOccupancy() - 1);
            student.setRoom(null);
            
            studentRepository.save(student);
            roomRepository.save(room);
        }
    }
    
    public Room searchRoom(String roomNum, Long dormId) {
        List<Room> rooms = roomRepository.findByDormitoryIdAndRoomNumContaining(dormId, roomNum);
        return rooms.isEmpty() ? null : rooms.get(0);
    }
    
    public Optional<Room> getRoomByStudent(Long studentId) {
        return roomRepository.findByStudentId(studentId);
    }
    

}

