package com.tracker.app.controller;

import com.tracker.app.dto.ApplicationRequest;
import com.tracker.app.dto.ApplicationResponse;
import com.tracker.app.dto.MessageResponse;
import com.tracker.app.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @GetMapping
    public ResponseEntity<List<ApplicationResponse>> getAllApplications(Principal principal) {
        List<ApplicationResponse> apps = applicationService.getApplicationsForUser(principal.getName());
        return ResponseEntity.ok(apps);
    }

    @PostMapping
    public ResponseEntity<ApplicationResponse> createApplication(@Valid @RequestBody ApplicationRequest request, Principal principal) {
        ApplicationResponse createdApp = applicationService.createApplication(principal.getName(), request);
        return ResponseEntity.ok(createdApp);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApplicationResponse> updateApplication(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationRequest request,
            Principal principal) {
        ApplicationResponse updatedApp = applicationService.updateApplication(principal.getName(), id, request);
        return ResponseEntity.ok(updatedApp);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteApplication(@PathVariable Long id, Principal principal) {
        applicationService.deleteApplication(principal.getName(), id);
        return ResponseEntity.ok(new MessageResponse("Application deleted successfully"));
    }
}
