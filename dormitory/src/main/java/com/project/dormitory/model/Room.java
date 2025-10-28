package com.project.dormitory.model;

import jakarta.persistence.*;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@IdClass(RoomId.class)
public class Room {
    @Id
    private String roomNum;

    @Id
    @ManyToOne
    @JoinColumn(name = "dorm_id")
    @JsonIgnore
    private Dormitory dormitory;

    private Integer floor;
    private String roomType;
    private String block;
    private Integer occupacy;
    private String lastInspect;
    private String duration;

    @OneToMany(mappedBy = "room")
    private List<Student> students;

    // Getters and Setters
    public String getRoomNum() { return roomNum; }
    public void setRoomNum(String roomNum) { this.roomNum = roomNum; }

    public Dormitory getDormitory() { return dormitory; }
    public void setDormitory(Dormitory dormitory) { this.dormitory = dormitory; }

    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    public String getBlock() { return block; }
    public void setBlock(String block) { this.block = block; }

    public Integer getOccupancy() { return occupacy; }
    public void setOccupancy(Integer occupancy) { this.occupacy = occupancy; }

    public String getLastInspect() { return lastInspect; }
    public void setLastInspect(String lastInspect) { this.lastInspect = lastInspect; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public List<Student> getStudents() { return students; }
    public void setStudents(List<Student> students) { this.students = students; }
}
