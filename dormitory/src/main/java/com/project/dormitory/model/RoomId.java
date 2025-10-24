package com.project.dormitory.model;

import java.io.Serializable;
import java.util.Objects;

public class RoomId implements Serializable {
    private String roomNum;
    private Long dormitory; // This should match the type of Dormitory's id

    public RoomId() {}

    public RoomId(String roomNum, Long dormitory) {
        this.roomNum = roomNum;
        this.dormitory = dormitory;
    }

    // Getters and Setters
    public String getRoomNum() { return roomNum; }
    public void setRoomNum(String roomNum) { this.roomNum = roomNum; }

    public Long getDormitory() { return dormitory; }
    public void setDormitory(Long dormitory) { this.dormitory = dormitory; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RoomId)) return false;
        RoomId that = (RoomId) o;
        return Objects.equals(roomNum, that.roomNum) && Objects.equals(dormitory, that.dormitory);
    }

    @Override
    public int hashCode() {
        return Objects.hash(roomNum, dormitory);
    }
}