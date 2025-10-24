package com.project.dormitory.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.dormitory.model.CheckInOut;
@RestController
@RequestMapping("/manager")
public class ManagerController {

    @GetMapping("/dashboard")
    public String dashboard() {
        return new String();
    }

    @GetMapping("/room")
    public String findAllRoom() {
        return new String();
    }

    @GetMapping("/room/{id}")
    public String room(@PathVariable Long id) {
        return new String();
    }

    @PostMapping("/room")
    public String postRoom(@RequestBody String entity) {
        //TODO: process POST request
        
        return entity;
    }

    @GetMapping("/service")
    public String findAllService() {
        return new String();
    }

    
    @GetMapping("/service/{id}")
    public String getService(@PathVariable Long id) {
        return new String();
    }

    @PostMapping("/service")
    public String postService(@RequestBody String entity) {
        //TODO: process POST request
        
        return entity;
    }
    
    @GetMapping("/announcement")
    public String announcement() {
        return new String();
    }

    @PostMapping("/announcement")
    public String postAnnoncement(@RequestBody String entity) {
        //TODO: process POST request
        
        return entity;
    }
    
    @GetMapping("/checkinout")
    public String checkinout(@PathVariable Long id) {
        return new String();
    }
    
    @PostMapping("/checkinout/{id}")
    public String postCheckinout(@PathVariable Long id) {
        return new String();
    }
    

}
