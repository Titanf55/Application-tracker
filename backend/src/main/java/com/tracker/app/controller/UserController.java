package com.tracker.app.controller;

import com.tracker.app.model.Application;
import com.tracker.app.model.User;
import com.tracker.app.repository.ApplicationRepository;
import com.tracker.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @GetMapping("/resume")
    public ResponseEntity<?> getResume(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Error: User not found"));
        return ResponseEntity.ok(Map.of("resumeText", user.getResumeText() != null ? user.getResumeText() : ""));
    }

    @PutMapping("/resume")
    public ResponseEntity<?> updateResume(@RequestBody Map<String, String> payload, Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Error: User not found"));
        
        user.setResumeText(payload.get("resumeText"));
        userRepository.save(user);
        
        // Invalidate match score cache for all user's applications
        List<Application> apps = applicationRepository.findByUserId(user.getId());
        for (Application app : apps) {
            app.setAiMatchScore(null);
            app.setAiMatchGaps(null);
            applicationRepository.save(app);
        }
        
        return ResponseEntity.ok(Map.of("message", "Resume highlights updated successfully"));
    }
}
