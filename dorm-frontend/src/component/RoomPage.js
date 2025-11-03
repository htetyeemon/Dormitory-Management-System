// src/component/RoomPage.js
import React, { useEffect, useState } from "react";
import { studentAPI } from "../service/api";
import { useAuth } from "../context/AuthContext";
import "../css/RoomPage.css";
import { useParams } from 'react-router-dom';

const RoomPage = () => {
  const { user } = useAuth();
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { studentId } = useParams();

  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const res = await studentAPI.getRoomInfo(user.id);
        setRoomData(res.data);
      } catch (err) {
        console.error("Error loading room info:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoomInfo();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const { room, roommate } = roomData || {};

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-display">
      <div className="container py-5 sm:py-8">
        {/* Header Section */}
        <div className="flex flex-wrap justify-between gap-4 p-4">
          <div className="flex min-w-72 flex-col gap-2">
            <h1 className="text-slate-900 dark:text-white text-4xl font-black">My Room</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base">
              Room {room?.roomNum || "205B"} - Block {room?.block || "A"}, Floor {room?.floor || "2"}
            </p>
          </div>
        </div>

        {/* Grid Layout with equal height columns */}
        <div className="room-grid">
          {/* Left Column */}
          <div className="room-column">
            {/* Room Details Card */}
            <div className="room-card room-details-card">
              <div className="card-header">
                <h2 className="card-title">Room Details</h2>
              </div>
              <div className="card-content">
                <div className="detail-row">
                  <span className="detail-label">Room Number</span>
                  <span className="detail-value">{room?.roomNum || "205B"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Building/Block</span>
                  <span className="detail-value">Block {room?.block || "A"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Floor</span>
                  <span className="detail-value">{room?.floor || "2nd Floor"}</span>
                </div>
              </div>
            </div>

            {/* Roommates Card */}
            <div className="room-card roommate-card">
              <div className="card-header">
                <h2 className="card-title">Roommates</h2>
              </div>
              <div className="card-content roommate-content">
                <div className="roommate-item">
                  <div className="roommate-info-full">
                    <p className="roommate-name">{roommate?.name || "Sarah Johnson"}</p>
                    <p className="roommate-major">{roommate?.major || "Software Engineering"}</p>
                    <a className="roommate-email" href={`mailto:${roommate?.email || "sarah.johnson@mfu.edu"}`}>
                      {roommate?.email || "sarah.johnson@mfu.edu"}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="room-column">
            {/* Contact Information Card */}
            <div className="room-card contact-card">
              <div className="card-header">
                <h2 className="card-title">Contact Information</h2>
              </div>
              <div className="card-content">
                <div className="contact-item">
                  <span className="material-symbols-outlined contact-icon">phone</span>
                  <a className="contact-link" href="tel:+1234567890">
                    +1 (234) 567-890
                  </a>
                </div>
                <div className="contact-item">
                  <span className="material-symbols-outlined contact-icon">email</span>
                  <a className="contact-link" href="mailto:manager@mfudorm.com">
                    manager@mfudorm.com
                  </a>
                </div>
                <div className="contact-item">
                  <span className="material-symbols-outlined contact-icon">location_on</span>
                  <span className="contact-text">123 University Drive, MFU City</span>
                </div>
              </div>
            </div>

            {/* Room Status Card */}
            <div className="room-card status-card">
              <div className="card-header">
                <h2 className="card-title">Room Status</h2>
              </div>
              <div className="card-content">
                <div className="detail-row">
                  <span className="detail-label">Occupancy</span>
                  <span className="detail-value">{room?.occupancy || "2"} / 2</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Last Inspection</span>
                  <span className="detail-value">{room?.lastInspect || "Jan 5, 2025"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Duration</span>
                  <span className="detail-value">{room?.duration || "1 Year"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;