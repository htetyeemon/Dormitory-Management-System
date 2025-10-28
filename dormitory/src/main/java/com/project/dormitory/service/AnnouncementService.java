package com.project.dormitory.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.project.dormitory.model.Announcement;
import com.project.dormitory.repository.AnnouncementRepo;

@Service
public class AnnouncementService {
    private final AnnouncementRepo announcementRepository;
    
    public AnnouncementService(AnnouncementRepo announcementRepository) {
        this.announcementRepository = announcementRepository;
    }
    
    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }
    
    public List<Announcement> getRecentAnnouncements() {
        // Get recent announcements (last 10 or based on date)
        return announcementRepository.findTop5ByOrderByDateTimeDesc();
    }
    
    public List<Announcement> getAnnouncements() {
        return announcementRepository.findAll();
    }

}
