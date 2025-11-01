package com.project.dormitory.model;

public class AuthenticationRequest {
    private Long id;
    private String password;
    private String userType; // "student" or "manager"

    // Constructors
    public AuthenticationRequest() {}

    public AuthenticationRequest(Long id, String password, String userType) {
        this.id = id;
        this.password = password;
        this.userType = userType;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }
}
