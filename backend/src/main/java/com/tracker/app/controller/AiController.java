package com.tracker.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tracker.app.model.Application;
import com.tracker.app.model.User;
import com.tracker.app.repository.ApplicationRepository;
import com.tracker.app.repository.UserRepository;
import com.tracker.app.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications/{id}/ai")
public class AiController {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AiService aiService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Application getValidatedApplication(Long id, Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Error: User not found"));
        
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Application not found"));
        
        if (!application.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Error: Unauthorized access to this application");
        }
        return application;
    }

    @GetMapping("/skills")
    public ResponseEntity<List<String>> getExtractedSkills(@PathVariable Long id, Principal principal) {
        Application application = getValidatedApplication(id, principal);

        // Check Cache
        if (application.getAiSkills() != null && !application.getAiSkills().trim().isEmpty()) {
            try {
                List<String> cached = objectMapper.readValue(
                    application.getAiSkills(), 
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class)
                );
                return ResponseEntity.ok(cached);
            } catch (Exception e) {
                // Fallback to fetch new if parsing fails
            }
        }

        String jobDesc = application.getJobDescription();
        if (jobDesc == null || jobDesc.trim().isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<String> skills = aiService.extractSkills(jobDesc);

        // Save Cache
        try {
            application.setAiSkills(objectMapper.writeValueAsString(skills));
            applicationRepository.save(application);
        } catch (Exception e) {
            // Fail silently
        }

        return ResponseEntity.ok(skills);
    }

    @GetMapping("/prep")
    public ResponseEntity<List<String>> getPrepQuestions(@PathVariable Long id, Principal principal) {
        Application application = getValidatedApplication(id, principal);

        // Check Cache
        if (application.getAiQuestions() != null && !application.getAiQuestions().trim().isEmpty()) {
            try {
                List<String> cached = objectMapper.readValue(
                    application.getAiQuestions(), 
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class)
                );
                return ResponseEntity.ok(cached);
            } catch (Exception e) {
                // Fallback to fetch new
            }
        }

        String jobDesc = application.getJobDescription();
        if (jobDesc == null || jobDesc.trim().isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<String> questions = aiService.generatePrepQuestions(
                application.getCompanyName(),
                application.getRole(),
                jobDesc
        );

        // Save Cache
        try {
            application.setAiQuestions(objectMapper.writeValueAsString(questions));
            applicationRepository.save(application);
        } catch (Exception e) {
            // Fail silently
        }

        return ResponseEntity.ok(questions);
    }

    @GetMapping("/match")
    public ResponseEntity<Map<String, Object>> getMatchScore(@PathVariable Long id, Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Error: User not found"));
        
        Application application = getValidatedApplication(id, principal);

        // Check Cache
        if (application.getAiMatchScore() != null && application.getAiMatchGaps() != null && !application.getAiMatchGaps().trim().isEmpty()) {
            try {
                List<String> cachedGaps = objectMapper.readValue(
                    application.getAiMatchGaps(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class)
                );
                return ResponseEntity.ok(Map.of(
                    "score", application.getAiMatchScore(),
                    "gaps", cachedGaps
                ));
            } catch (Exception e) {
                // Fallback to fetch new
            }
        }
        
        String jobDesc = application.getJobDescription();
        String resumeText = user.getResumeText();
        
        if (jobDesc == null || jobDesc.trim().isEmpty()) {
            return ResponseEntity.ok(Map.of("score", 0, "gaps", List.of("No job description provided.")));
        }
        if (resumeText == null || resumeText.trim().isEmpty()) {
            return ResponseEntity.ok(Map.of("score", 0, "gaps", List.of("Please upload/paste your resume highlights first.")));
        }
        
        Map<String, Object> matchResult = aiService.calculateMatchScore(resumeText, jobDesc);

        // Save Cache
        try {
            Number score = (Number) matchResult.get("score");
            List<String> gaps = (List<String>) matchResult.get("gaps");
            application.setAiMatchScore(score != null ? score.intValue() : 0);
            application.setAiMatchGaps(objectMapper.writeValueAsString(gaps));
            applicationRepository.save(application);
        } catch (Exception e) {
            // Fail silently
        }

        return ResponseEntity.ok(matchResult);
    }
}
