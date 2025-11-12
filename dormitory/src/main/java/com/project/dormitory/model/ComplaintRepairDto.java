package com.project.dormitory.model;

public class ComplaintRepairDto {
    
    private Long id;
    private String description;
    private String status;
    private String studentName;
    private Long studentId;
    private String priorityLvl;
    public String getPriorityLvl() {
        return priorityLvl;
    }
    public void setPriorityLvl(String priorityLvl) {
        this.priorityLvl = priorityLvl;
    }
    public String getType() {
        return type;
    }
    public void setType(String type) {
        this.type = type;
    }
    private String type;
    private String roomNumber;
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public String getStudentName() {
        return studentName;
    }
    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }
    public Long getStudentId() {
        return studentId;
    }
    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }
    public String getRoomNumber() {
        return roomNumber;
    }
    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }


}
