package com.project.dormitory.service;

import org.springframework.stereotype.Service;

import com.project.dormitory.model.Room;
import com.project.dormitory.model.RoomInfoResponse;
import com.project.dormitory.model.Student;
import com.project.dormitory.repository.StudentRepo;

@Service
public class RoomService {
    private final StudentRepo studentRepository;

    public RoomService(StudentRepo studentRepository) {
        this.studentRepository = studentRepository;
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

}
