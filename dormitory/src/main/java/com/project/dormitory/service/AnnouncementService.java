package com.project.dormitory.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.dormitory.model.Announcement;
import com.project.dormitory.model.DormitoryManager;
import com.project.dormitory.repository.AnnouncementRepo;
import com.project.dormitory.repository.DormitoryManagerRepo;

import jakarta.transaction.Transactional;

@Service
public class AnnouncementService {
    @Autowired
    private final AnnouncementRepo announcementRepository;
    
    @Autowired
    private DormitoryManagerRepo dormitoryManagerRepository;
    
    public List<Announcement> getAllAnnouncementsByManager(Long managerId) {
        return announcementRepository.findByManagerIdOrderByDateTimeDesc(managerId);
    }
    
    public List<Announcement> searchAnnouncementsByTitle(Long managerId, String keyword) {
        return announcementRepository.findByManagerIdAndTitleContainingOrderByDateTimeDesc(managerId, keyword);
    }
    
    public long getAnnouncementCount(Long managerId) {
        return announcementRepository.countByManagerId(managerId);
    }
    
    @Transactional
    public Announcement createAnnouncement(Long managerId, Announcement announcement) {
        DormitoryManager manager = dormitoryManagerRepository.findById(managerId)
            .orElseThrow(() -> new RuntimeException("Manager not found"));
        
        announcement.setManager(manager);
        announcement.setDateTime(LocalDateTime.now());
        
        return announcementRepository.save(announcement);
    }
    
    @Transactional
    public Announcement updateAnnouncement(Long announcementId, Announcement announcementDetails) {
        Announcement announcement = announcementRepository.findById(announcementId)
            .orElseThrow(() -> new RuntimeException("Announcement not found"));
        
        announcement.setTitle(announcementDetails.getTitle());
        announcement.setDescription(announcementDetails.getDescription());
        announcement.setDateTime(LocalDateTime.now());
        
        return announcementRepository.save(announcement);
    }
    
    @Transactional
    public void deleteAnnouncement(Long announcementId) {
        Announcement announcement = announcementRepository.findById(announcementId)
            .orElseThrow(() -> new RuntimeException("Announcement not found"));
        announcementRepository.delete(announcement);
    }
    
    @Transactional
    public void deleteAllByManager(Long managerId) {
        announcementRepository.deleteByManagerId(managerId);
    }
    
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

    public List<Announcement> getAllAnnouncementsByDateAsc(){
        return announcementRepository.findAllByOrderByDateTimeAsc();
    }

    public List<Announcement> getAllAnnouncementsByDateDesc(){
        return announcementRepository.findAllByOrderByDateTimeDesc();
    }

    public List<Announcement> getAllAnnouncementsByDormitory(Long dormId) {
        return announcementRepository.findByManagerDormitoryIdOrderByDateTimeDesc(dormId);
    }
    
    public List<Announcement> getRecentAnnouncementsByDormitory(Long dormId) {
        List<Announcement> allAnnouncements = getAllAnnouncementsByDormitory(dormId);
        return allAnnouncements.stream()
                .limit(5)
                .collect(Collectors.toList());
    }

}
