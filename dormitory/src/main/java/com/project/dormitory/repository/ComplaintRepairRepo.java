package com.project.dormitory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComplaintRepairRepo extends JpaRepository<ComplaintRepairRepo,Long> {

}
