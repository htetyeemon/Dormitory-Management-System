package com.project.dormitory.model;

import java.time.LocalDate;

public class CheckInOutDto {
    private Long id;
    private String type;
    private String status;
    private LocalDate date;
    private String studentName;
    private String roomNum;

    public CheckInOutDto(Long id, String type, String status, LocalDate date,
                         String studentName, String roomNum) {
        this.id = id;
        this.type = type;
        this.status = status;
        this.date = date;
        this.studentName = studentName;
        this.roomNum = roomNum;
    }

    // Getters
    public Long getId() { return id; }
    public String getType() { return type; }
    public String getStatus() { return status; }
    public LocalDate getDate() { return date; }
    public String getStudentName() { return studentName; }
    public String getRoomNum() { return roomNum; }
}
