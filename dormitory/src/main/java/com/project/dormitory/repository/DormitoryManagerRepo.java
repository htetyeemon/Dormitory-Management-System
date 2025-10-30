package com.project.dormitory.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.dormitory.model.DormitoryManager;

@Repository
public interface DormitoryManagerRepo extends JpaRepository<DormitoryManager,Long>{
    Optional<DormitoryManager> findByEmail(String email);

    @Query("SELECT dm.dormitory.id FROM DormitoryManager dm WHERE dm.id = :managerId")
    Optional<Long> findDormitoryIdByManagerId(@Param("managerId") Long managerId);


}
