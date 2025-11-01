package com.project.dormitory.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.project.dormitory.model.*;
import com.project.dormitory.service.AuthenticationService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private AuthenticationService authenticationService;

    public AuthController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) {
        try {
            AuthenticationResponse response = authenticationService.authenticate(request);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(401).body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new AuthenticationResponse(false, "Login failed: " + e.getMessage()));
        }
    }

    // Optional: Password change endpoints
    @PostMapping("/student/{studentId}/change-password")
    public ResponseEntity<String> changeStudentPassword(
            @PathVariable Long studentId,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        // Implementation for password change
        return ResponseEntity.ok("Password changed successfully");
    }

    @PostMapping("/manager/{managerId}/change-password")
    public ResponseEntity<String> changeManagerPassword(
            @PathVariable Long managerId,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        // Implementation for password change
        return ResponseEntity.ok("Password changed successfully");
    }
}
