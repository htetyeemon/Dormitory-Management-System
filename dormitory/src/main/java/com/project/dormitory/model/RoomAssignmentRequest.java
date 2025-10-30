package com.project.dormitory.model;

public class RoomAssignmentRequest {
    private Long studentId;
    private String roomNum;

    // Constructors
    public RoomAssignmentRequest() {}

    public RoomAssignmentRequest(Long studentId, String roomNum) {
        this.studentId = studentId;
        this.roomNum = roomNum;
    }

    // Getters and setters
    public Long getStudentId() { 
        return studentId; 
    }
    
    public void setStudentId(Long studentId) { 
        this.studentId = studentId; 
    }
    
    public String getRoomNum() { 
        return roomNum; 
    }
    
    public void setRoomNum(String roomNum) { 
        this.roomNum = roomNum; 
    }
}
