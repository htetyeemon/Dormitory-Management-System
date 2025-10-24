package com.project.dormitory.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Student {
    @Id
    private Long id;

    private String name;
    private String major;
    private String email;
    private String phoneNum;
    private String status;
    /////

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "roommate_id")
    private Student roommate;

    // FIX: For composite key, use @JoinColumns
    @ManyToOne
    @JoinColumns({
        @JoinColumn(name = "room_num", referencedColumnName = "roomNum"),
        @JoinColumn(name = "dorm_id_room", referencedColumnName = "dorm_id")
    })
    private Room room;

    @OneToOne(mappedBy = "roommate")
    private Student pairedStudent;

    @OneToMany(mappedBy = "student")
    private List<ComplaintRepair> complaints;

    @OneToMany(mappedBy = "student")
    private List<CheckInOut> checkInOuts;

    // Getters and Setters (same as before)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getMajor() { return major; }
    public void setMajor(String major) { this.major = major; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNum() { return phoneNum; }
    public void setPhoneNum(String phoneNum) { this.phoneNum = phoneNum; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Student getRoommate() { return roommate; }
    public void setRoommate(Student roommate) { this.roommate = roommate; }

    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }

    public List<ComplaintRepair> getComplaints() { return complaints; }
    public void setComplaints(List<ComplaintRepair> complaints) { this.complaints = complaints; }

    public List<CheckInOut> getCheckInOuts() { return checkInOuts; }
    public void setCheckInOuts(List<CheckInOut> checkInOuts) { this.checkInOuts = checkInOuts; }

    public Student getPairedStudent() { return pairedStudent; }
    public void setPairedStudent(Student pairedStudent) { this.pairedStudent = pairedStudent; }
}