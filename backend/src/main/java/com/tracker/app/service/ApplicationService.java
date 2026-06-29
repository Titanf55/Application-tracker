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

    public List<ApplicationResponse> getApplicationsForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: User not found"));

        return applicationRepository.findByUserId(user.getId()).stream()
                .map(app -> new ApplicationResponse(
                        app.getId(),
                        app.getCompanyName(),
                        app.getRole(),
                        app.getApplicationDate(),
                        app.getStatus()
                ))
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

        Application savedApp = applicationRepository.save(application);

        return new ApplicationResponse(
                savedApp.getId(),
                savedApp.getCompanyName(),
                savedApp.getRole(),
                savedApp.getApplicationDate(),
                savedApp.getStatus()
        );
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

        application.setCompanyName(request.getCompanyName());
        application.setRole(request.getRole());
        application.setApplicationDate(request.getApplicationDate());
        application.setStatus(request.getStatus());

        Application updatedApp = applicationRepository.save(application);

        return new ApplicationResponse(
                updatedApp.getId(),
                updatedApp.getCompanyName(),
                updatedApp.getRole(),
                updatedApp.getApplicationDate(),
                updatedApp.getStatus()
        );
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
