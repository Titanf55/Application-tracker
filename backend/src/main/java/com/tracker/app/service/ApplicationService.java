package com.tracker.app.service;

import com.tracker.app.dto.ApplicationRequest;
import com.tracker.app.dto.ApplicationResponse;
import com.tracker.app.model.Application;
import com.tracker.app.model.User;
import com.tracker.app.repository.ApplicationRepository;
import com.tracker.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    private ApplicationResponse mapToResponse(Application app) {
        return new ApplicationResponse(
                app.getId(),
                app.getCompanyName(),
                app.getRole(),
                app.getApplicationDate(),
                app.getStatus(),
                app.getJobDescription(),
                app.getOaDateTime(),
                app.getInterviewDateTime(),
                app.isOaReminder(),
                app.isInterviewReminder()
        );
    }

    public List<ApplicationResponse> getApplicationsForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: User not found"));

        return applicationRepository.findByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ApplicationResponse createApplication(String username, ApplicationRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: User not found"));

        Application application = new Application(
                user,
                request.getCompanyName(),
                request.getRole(),
                request.getApplicationDate(),
                request.getStatus()
        );
        application.setJobDescription(request.getJobDescription());
        application.setOaDateTime(request.getOaDateTime());
        application.setInterviewDateTime(request.getInterviewDateTime());
        application.setOaReminder(request.isOaReminder());
        application.setInterviewReminder(request.isInterviewReminder());

        Application savedApp = applicationRepository.save(application);

        return mapToResponse(savedApp);
    }

    public ApplicationResponse updateApplication(String username, Long appId, ApplicationRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: User not found"));

        Application application = applicationRepository.findById(appId)
                .orElseThrow(() -> new RuntimeException("Error: Application not found"));

        // Enforce ownership: only allow the owner to update the application
        if (!application.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Error: Unauthorized access to this application");
        }

        // Clear cached AI results if job description has changed
        if (application.getJobDescription() == null || !application.getJobDescription().equals(request.getJobDescription())) {
            application.setAiSkills(null);
            application.setAiQuestions(null);
            application.setAiMatchScore(null);
            application.setAiMatchGaps(null);
        }
        // Reset email sent flags if the scheduled dates have been modified/rescheduled
        if (application.getOaDateTime() == null || !application.getOaDateTime().equals(request.getOaDateTime())) {
            application.setOaEmailSent(false);
        }
        if (application.getInterviewDateTime() == null || !application.getInterviewDateTime().equals(request.getInterviewDateTime())) {
            application.setInterviewEmailSent(false);
        }
        application.setCompanyName(request.getCompanyName());
        application.setRole(request.getRole());
        application.setApplicationDate(request.getApplicationDate());
        application.setStatus(request.getStatus());
        application.setJobDescription(request.getJobDescription());
        application.setOaDateTime(request.getOaDateTime());
        application.setInterviewDateTime(request.getInterviewDateTime());
        application.setOaReminder(request.isOaReminder());
        application.setInterviewReminder(request.isInterviewReminder());

        Application updatedApp = applicationRepository.save(application);

        return mapToResponse(updatedApp);
    }

    public void deleteApplication(String username, Long appId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: User not found"));

        Application application = applicationRepository.findById(appId)
                .orElseThrow(() -> new RuntimeException("Error: Application not found"));

        // Enforce ownership: only allow the owner to delete the application
        if (!application.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Error: Unauthorized access to this application");
        }

        applicationRepository.delete(application);
    }
}
