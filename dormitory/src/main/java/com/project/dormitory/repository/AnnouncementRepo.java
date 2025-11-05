package com.project.dormitory.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.dormitory.model.Announcement;

@Repository
public interface AnnouncementRepo extends JpaRepository<Announcement,Long>{

    List<Announcement> findTop5ByOrderByDateTimeDesc();

    /**
     * Find all announcements by manager ID, ordered by date/time descending (newest first)
     */
    List<Announcement> findByManagerIdOrderByDateTimeDesc(Long managerId);
    
    /**
     * Find announcements by title containing keyword
     */
    List<Announcement> findByManagerIdAndTitleContainingOrderByDateTimeDesc(
            Long managerId, String title);
    
    /**
     * Find announcements by description containing keyword
     */
    List<Announcement> findByManagerIdAndDescriptionContainingOrderByDateTimeDesc(
            Long managerId, String description);
    
    /**
     * Count announcements by manager
     */
    long countByManagerId(Long managerId);

        /**
     * Delete announcements by manager ID
     */
    void deleteByManagerId(Long managerId);

    List<Announcement> findAllByOrderByDateTimeAsc();

    List<Announcement> findAllByOrderByDateTimeDesc();

}

