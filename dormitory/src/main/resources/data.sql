-- First create tables without foreign keys that reference each other
-- Insert Dormitory Managers (13 managers for 13 dormitories)

-- Insert Dormitories (each with unique manager)
/*INSERT INTO dormitory (id, building_num, building_name, address, phone_num, email) VALUES
(101, '1', 'F', 'MFU', '021234567', 'dormitory101@lamduan.mfu.ac.th'),
(102, '2', 'F', 'MFU', '021234568', 'dormitory102@lamduan.mfu.ac.th'),
(103, '3', 'lamduan', 'MFU', '021234569', 'dormitory103@lamduan.mfu.ac.th'),
(104, '4', 'lamduan', 'MFU', '021234570', 'dormitory104@lamduan.mfu.ac.th'),
(105, '5', 'F', 'MFU', '021234571', 'dormitory105@lamduan.mfu.ac.th'),
(106, '6', 'F', 'MFU', '021234572', 'dormitory106@lamduan.mfu.ac.th'),
(201, '1', 'lamduan', 'MFU', '021234573', 'dormitory201@lamduan.mfu.ac.th'),
(202, '2', 'lamduan', 'MFU', '021234574', 'dormitory202@lamduan.mfu.ac.th'),
(203, '3', 'F', 'MFU', '021234575', 'dormitory203@lamduan.mfu.ac.th'),
(204, '4', 'F', 'MFU', '021234576', 'dormitory204@lamduan.mfu.ac.th'),
(205, '5', 'lamduan', 'MFU', '021234577', 'dormitory205@lamduan.mfu.ac.th'),
(206, '6', 'lamduan', 'MFU', '021234578', 'dormitory206@lamduan.mfu.ac.th'),
(207, '7', 'F', 'MFU', '021234579', 'dormitory207@lamduan.mfu.ac.th');

INSERT INTO dormitory_manager (id, name, phone, email, dorm_id) VALUES
(1, 'Dorathy', '097391018823', 'Dorathy1@lamduan.mfu.ac.th', 101),
(2, 'Robert', '0987654321', 'Robert2@lamduan.mfu.ac.th', 102),
(3, 'Susan', '0998765432', 'Susan3@lamduan.mfu.ac.th', 103),
(4, 'Thomas', '0912345678', 'Thomas4@lamduan.mfu.ac.th', 104),
(5, 'Lisa', '0923456789', 'Lisa5@lamduan.mfu.ac.th', 105),
(6, 'Kevin', '0934567890', 'Kevin6@lamduan.mfu.ac.th', 106),
(7, 'Michael', '0945678901', 'Michael7@lamduan.mfu.ac.th', 201),
(8, 'Jennifer', '0956789012', 'Jennifer8@lamduan.mfu.ac.th', 202),
(9, 'David', '0967890123', 'David9@lamduan.mfu.ac.th', 203),
(10, 'Sarah', '0978901234', 'Sarah10@lamduan.mfu.ac.th', 204),
(11, 'James', '0989012345', 'James11@lamduan.mfu.ac.th', 205),
(12, 'Emily', '0990123456', 'Emily12@lamduan.mfu.ac.th', 206),
(13, 'Daniel', '0911234567', 'Daniel13@lamduan.mfu.ac.th', 207);


-- Insert Rooms (distributed across all 13 dormitories)
INSERT INTO room (room_num, dorm_id, floor, room_type, block, occupacy, last_inspect, duration) VALUES
('101', 101, 1, 'Single', 'A', 2, '2025-01-22', 1),
('102', 102, 2, 'Double', 'B', 2, '2025-02-27', 2),
('103', 103, 3, 'Single', 'C', 2, '2025-03-15', 1),
('104', 104, 4, 'Double', 'D', 2, '2025-03-22', 2),
('105', 105, 1, 'Single', 'A', 2, '2025-03-31', 1),
('106', 106, 2, 'Double', 'B', 2, '2025-04-01', 2),
('107', 201, 3, 'Single', 'C', 2, '2025-04-12', 1),
('108', 202, 4, 'Double', 'D', 0, '2025-04-18', 2),
('201', 203, 1, 'Single', 'A', 0, '2025-04-21', 1),
('202', 204, 2, 'Double', 'B', 0, '2025-04-29', 2),
('203', 205, 3, 'Single', 'C', 0, '2025-05-15', 1),
('204', 206, 4, 'Double', 'D', 0, '2025-05-20', 2),
('205', 207, 1, 'Single', 'A', 0, '2025-05-25', 1);

-- Insert Students WITHOUT roommate_id first (to avoid circular reference)
INSERT INTO student (id, name, major, email, phone_num, dorm_id, room_num) VALUES
(6731503001, 'Mary', 'software engineering', '6731503001@lamduan.mfu.ac.th', '0912345678', 101, '101'),
(6731503010, 'Jane', 'computer engineering', '6731503010@lamduan.mfu.ac.th', '0991011123', 101, '101'),
(6731503002, 'John', 'Business Administration', '6731503002@lamduan.mfu.ac.th', '0993713027', 102, '102'),
(6731503009, 'Jack', 'Tourism', '6731503009@lamduan.mfu.ac.th', '09914746104', 102, '102'),
(6731503003, 'Sarah', 'Data Science', '6731503003@lamduan.mfu.ac.th', '0991234567', 103, '103'),
(6731503004, 'Emily', 'Artificial Intelligence', '6731503004@lamduan.mfu.ac.th', '0997654321', 103, '103'),
(6731503005, 'Michael', 'Electrical Engineering', '6731503005@lamduan.mfu.ac.th', '0991112222', 104, '104'),
(6731503006, 'David', 'Mechanical Engineering', '6731503006@lamduan.mfu.ac.th', '0993334444', 104, '104'),
(6731503007, 'Jessica', 'Psychology', '6731503007@lamduan.mfu.ac.th', '0995556666', 105, '105'),
(6731503008, 'Amanda', 'Sociology', '6731503008@lamduan.mfu.ac.th', '0997778888', 105, '105'),
(6731503011, 'Christopher', 'Civil Engineering', '6731503011@lamduan.mfu.ac.th', '0998889999', 106, '106'),
(6731503012, 'Matthew', 'Architecture', '6731503012@lamduan.mfu.ac.th', '0999990000', 106, '106'),
(6731503013, 'Ashley', 'Nursing', '6731503013@lamduan.mfu.ac.th', '0990001111', 201, '107'),
(6731503014, 'Brittany', 'Medicine', '6731503014@lamduan.mfu.ac.th', '0991112222', 201, '107');

-- Now update roommate relationships
UPDATE student SET roommate_id = 6731503010 WHERE id = 6731503001;
UPDATE student SET roommate_id = 6731503001 WHERE id = 6731503010;
UPDATE student SET roommate_id = 6731503009 WHERE id = 6731503002;
UPDATE student SET roommate_id = 6731503002 WHERE id = 6731503009;
UPDATE student SET roommate_id = 6731503004 WHERE id = 6731503003;
UPDATE student SET roommate_id = 6731503003 WHERE id = 6731503004;
UPDATE student SET roommate_id = 6731503006 WHERE id = 6731503005;
UPDATE student SET roommate_id = 6731503005 WHERE id = 6731503006;
UPDATE student SET roommate_id = 6731503008 WHERE id = 6731503007;
UPDATE student SET roommate_id = 6731503007 WHERE id = 6731503008;
UPDATE student SET roommate_id = 6731503012 WHERE id = 6731503011;
UPDATE student SET roommate_id = 6731503011 WHERE id = 6731503012;
UPDATE student SET roommate_id = 6731503014 WHERE id = 6731503013;
UPDATE student SET roommate_id = 6731503013 WHERE id = 6731503014;

-- Insert Announcements (using various managers)
INSERT INTO announcement (id, title, description, date_time, mgr_id) VALUES
(1, 'Scheduled Water Shut-off', 'Water will be temporarily shut off for maintenance on May 25th from 9 AM to 12 PM.', '2025-09-12 10:00:00', 1),
(2, 'Elevator Maintenance', 'The east elevator in Building A will be out of service for scheduled maintenance on June 15th from 8 AM to 4 PM. Please use the west elevator or stairs.', '2025-06-10 09:00:00', 2),
(3, 'Annual Fire Drill', 'The mandatory annual fire drill for all residents is scheduled for July 8th at 10:00 AM. Please follow exit signs and assemble at the designated areas in the parking lot.', '2025-07-01 08:00:00', 3),
(4, 'Parking Lot Resurfacing', 'The main parking lot will be resurfaced from August 5th to August 7th. No parking will be available during this period. Alternative parking has been arranged at the adjacent overflow lot.', '2025-07-25 14:00:00', 4),
(5, 'Community BBQ Event', 'You''re invited to our annual Summer Community BBQ! Join us on August 20th from 3 PM to 7 PM in the central courtyard. Food, drinks, and games will be provided.', '2025-08-05 16:00:00', 5),
(6, 'HVAC System Upgrade', 'A major upgrade to the central HVAC system will begin on September 1st. There may be short, intermittent interruptions to air conditioning over the following two weeks. We appreciate your patience.', '2025-08-20 11:00:00', 6),
(7, 'Lobby Renovation Starting', 'The main lobby will be undergoing renovation starting October 10th. A temporary reception desk will be set up in the conference room B. Expect some noise and dust during work hours.', '2025-09-28 13:00:00', 7),
(8, 'New Security System', 'A new security camera system will be installed throughout the campus starting next week. There may be temporary disruptions in certain areas.', '2025-10-15 09:00:00', 8),
(9, 'Internet Upgrade', 'Campus-wide internet upgrade scheduled for November 1st. Expect intermittent connectivity between 2-4 AM.', '2025-10-20 14:00:00', 9),
(10, 'Winter Break Schedule', 'Winter break schedule and facility hours have been posted. Please check the notice board for details.', '2025-11-01 10:00:00', 10);

-- Insert sample Complaint/Repair records
INSERT INTO complaint_repair (id,description, service_type, date_time, priority_lvl, status, stu_id) VALUES
(1,'AC not cooling properly', 'REPAIR', '2024-09-15 14:30:00', 'HIGH', 'PENDING', 6731503001),
(2,'Leaking faucet in bathroom', 'REPAIR', '2024-09-20 10:15:00', 'MEDIUM', 'IN_PROGRESS', 6731503002),
(3,'WiFi connection unstable', 'COMPLAINT', '2024-09-25 16:45:00', 'HIGH', 'RESOLVED', 6731503003),
(4,'Broken desk drawer', 'REPAIR', '2024-10-01 09:30:00', 'LOW', 'PENDING', 6731503010),
(5,'Light bulb replacement needed', 'REPAIR', '2024-10-05 11:20:00', 'LOW', 'RESOLVED', 6731503005),
(6,'No hot water in shower', 'REPAIR', '2024-10-10 08:45:00', 'HIGH', 'IN_PROGRESS', 6731503007);

-- Insert sample Check-in/Out records with individual IDs
INSERT INTO check_in_out (id, stu_id, date, type) VALUES
(1, 6731503001, '2024-08-01', 'CHECK_IN'),
(2, 6731503010, '2024-08-01', 'CHECK_IN'),
(3, 6731503002, '2024-08-02', 'CHECK_IN'),
(4, 6731503009, '2024-08-02', 'CHECK_IN'),
(5, 6731503009, '2024-12-15', 'CHECK_OUT'),
(6, 6731503003, '2024-08-03', 'CHECK_IN'),
(7, 6731503004, '2024-08-03', 'CHECK_IN'),
(8, 6731503005, '2024-08-04', 'CHECK_IN'),
(9, 6731503006, '2024-08-04', 'CHECK_IN'),
(10, 6731503006, '2024-12-20', 'CHECK_OUT'),
(11, 6731503007, '2024-08-05', 'CHECK_IN'),
(12, 6731503008, '2024-08-05', 'CHECK_IN'),
(13, 6731503011, '2024-08-06', 'CHECK_IN'),
(14, 6731503012, '2024-08-06', 'CHECK_IN'),
(15, 6731503013, '2024-08-07', 'CHECK_IN'),
(16, 6731503014, '2024-08-07', 'CHECK_IN'),
(17, 6731503011, '2024-12-18', 'CHECK_OUT'),
(18, 6731503013, '2024-12-22', 'CHECK_OUT'),
(19, 6731503001, '2024-09-10', 'CHECK_OUT'),
(20, 6731503001, '2024-09-15', 'CHECK_IN'),
(21, 6731503002, '2024-10-05', 'CHECK_OUT'),
(22, 6731503002, '2024-10-10', 'CHECK_IN'),
(23, 6731503007, '2024-11-20', 'CHECK_OUT'),
(24, 6731503007, '2024-11-25', 'CHECK_IN');
*/