package com.project.dormitory.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.dormitory.repository.DormitoryManagerRepo;

@Service
public class ManagerService {

    @Autowired
    private DormitoryManagerRepo dormitoryManagerRepository;

    public Long getDormitoryIdByManagerId(Long managerId) {
        return dormitoryManagerRepository.findDormitoryIdByManagerId(managerId)
            .orElseThrow(() -> new RuntimeException("Manager with ID " + managerId + " is not assigned to any dormitory or not found"));
    }

}
