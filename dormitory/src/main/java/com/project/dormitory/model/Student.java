package com.project.dormitory.model;

import jakarta.persistence.*;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class Student {
    @Id
    private Long id;

    private String name;
    private String major;
    private String email;
    private String phoneNum;

    @JsonIgnore
    private String password;
    
    /////
    @JsonIgnore
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "roommate_id")
    private Student roommate;

    // FIX: For composite key, use @JoinColumns
    @ManyToOne
    @JoinColumns({
        @JoinColumn(name = "room_num", referencedColumnName = "roomNum"),
        @JoinColumn(name = "dorm_id", referencedColumnName = "dorm_id")
    })
    @JsonIgnore
    private Room room;

    @JsonIgnore
    @OneToOne(mappedBy = "roommate")
    private Student pairedStudent;

    @JsonIgnore
    @OneToMany(mappedBy = "student")
    private List<ComplaintRepair> complaints;

    @JsonIgnore
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

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

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