package com.project.dormitory.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.dormitory.model.Announcement;

public interface AnnouncementRepo extends JpaRepository<Announcement,Long>{

}

