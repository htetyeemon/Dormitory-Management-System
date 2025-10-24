package com.project.dormitory.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.dormitory.model.CheckInOut;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
@RequestMapping("/student")
public class StudentController {
    @GetMapping("/dashboard")
    public String dashboard() {
        return new String();
    }

    @GetMapping("/room/{id}")
    public String room(@PathVariable Long id) {
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
    
    @GetMapping("/checkinout/{id}")
    public String checkinout(@PathVariable Long id) {
        return new String();
    }
    
    @PostMapping("/checkinout/{id}/form")
    public String getMethodName(@RequestBody CheckInOut checkInOut) {
        return new String();
    }
    

    
}
