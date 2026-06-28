package com.tracker.app.dto;

import java.time.LocalDate;

public class ApplicationResponse {
    private Long id;
    private String companyName;
    private String role;
    private LocalDate applicationDate;
    private String status;

    public ApplicationResponse() {}

    public ApplicationResponse(Long id, String companyName, String role, LocalDate applicationDate, String status) {
        this.id = id;
        this.companyName = companyName;
        this.role = role;
        this.applicationDate = applicationDate;
        this.status = status;
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
}
