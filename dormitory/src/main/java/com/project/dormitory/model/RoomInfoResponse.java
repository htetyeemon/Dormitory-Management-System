package com.project.dormitory.model;

public class RoomInfoResponse {
        private Room room;
        private Student roommate;

        public RoomInfoResponse(Room room, Student roommate) {
            this.room = room;
            this.roommate = roommate;
        }

        // Getters and setters
        public Room getRoom() { return room; }
        public void setRoom(Room room) { this.room = room; }
        public Student getRoommate() { return roommate; }
        public void setRoommate(Student roommate) { this.roommate = roommate; }
}

