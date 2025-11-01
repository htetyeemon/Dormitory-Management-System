package com.project.dormitory.model;

public class AuthenticationResponse {
    private boolean success;
    private String message;
    private Long userId;
    private String userType;
    private String name;
    private String email;

    // Constructors
    public AuthenticationResponse() {}

    public AuthenticationResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public AuthenticationResponse(boolean success, String message, Long userId, String userType, String name, String email) {
        this.success = success;
        this.message = message;
        this.userId = userId;
        this.userType = userType;
        this.name = name;
        this.email = email;
    }

    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
