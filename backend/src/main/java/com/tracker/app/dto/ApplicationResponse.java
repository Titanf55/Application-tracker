package com.tracker.app.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ApplicationResponse {
    private Long id;
    private String companyName;
    private String role;
    private LocalDate applicationDate;
    private String status;
    private String jobDescription;
    private LocalDateTime oaDateTime;
    private LocalDateTime interviewDateTime;
    private boolean oaReminder;
    private boolean interviewReminder;

    public ApplicationResponse() {}

    public ApplicationResponse(Long id, String companyName, String role, LocalDate applicationDate, String status, String jobDescription) {
        this.id = id;
        this.companyName = companyName;
        this.role = role;
        this.applicationDate = applicationDate;
        this.status = status;
        this.jobDescription = jobDescription;
    }

    public ApplicationResponse(Long id, String companyName, String role, LocalDate applicationDate, String status, String jobDescription, 
                               LocalDateTime oaDateTime, LocalDateTime interviewDateTime, boolean oaReminder, boolean interviewReminder) {
        this.id = id;
        this.companyName = companyName;
        this.role = role;
        this.applicationDate = applicationDate;
        this.status = status;
        this.jobDescription = jobDescription;
        this.oaDateTime = oaDateTime;
        this.interviewDateTime = interviewDateTime;
        this.oaReminder = oaReminder;
        this.interviewReminder = interviewReminder;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDate getApplicationDate() {
        return applicationDate;
    }

    public void setApplicationDate(LocalDate applicationDate) {
        this.applicationDate = applicationDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }

    public LocalDateTime getOaDateTime() {
        return oaDateTime;
    }

    public void setOaDateTime(LocalDateTime oaDateTime) {
        this.oaDateTime = oaDateTime;
    }

    public LocalDateTime getInterviewDateTime() {
        return interviewDateTime;
    }

    public void setInterviewDateTime(LocalDateTime interviewDateTime) {
        this.interviewDateTime = interviewDateTime;
    }

    public boolean isOaReminder() {
        return oaReminder;
    }

    public void setOaReminder(boolean oaReminder) {
        this.oaReminder = oaReminder;
    }

    public boolean isInterviewReminder() {
        return interviewReminder;
    }

    public void setInterviewReminder(boolean interviewReminder) {
        this.interviewReminder = interviewReminder;
    }
}
