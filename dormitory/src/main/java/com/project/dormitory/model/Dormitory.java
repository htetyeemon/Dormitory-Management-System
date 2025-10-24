package com.project.dormitory.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Dormitory {
    @Id
    private Long id;

    private String buildingNum;
    private String buildingName;
    private String address;
    private String phoneNum;
    private String email;

    @ManyToOne
    @JoinColumn(name = "mgr_id")
    private DormitoryManager manager;

    @OneToMany(mappedBy = "dormitory")
    private List<Room> rooms;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBuildingNum() { return buildingNum; }
    public void setBuildingNum(String buildingNum) { this.buildingNum = buildingNum; }

    public String getBuildingName() { return buildingName; }
    public void setBuildingName(String buildingName) { this.buildingName = buildingName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhoneNum() { return phoneNum; }
    public void setPhoneNum(String phoneNum) { this.phoneNum = phoneNum; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public DormitoryManager getManager() { return manager; }
    public void setManager(DormitoryManager manager) { this.manager = manager; }

    public List<Room> getRooms() { return rooms; }
    public void setRooms(List<Room> rooms) { this.rooms = rooms; }
}
