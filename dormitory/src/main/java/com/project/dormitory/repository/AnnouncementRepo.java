package com.project.dormitory.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.dormitory.model.Announcement;

@Repository
public interface AnnouncementRepo extends JpaRepository<Announcement,Long>{

    List<Announcement> findTop5ByOrderByDateTimeDesc();

}

