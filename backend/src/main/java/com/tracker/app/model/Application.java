package com.tracker.app.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Column(name = "company_name")
    private String companyName;

    @NotBlank
    private String role;

    @NotNull
    @Column(name = "application_date")
    private LocalDate applicationDate;

    @NotBlank
    private String status;

    @Column(name = "job_description", columnDefinition = "TEXT")
    private String jobDescription;

    @Column(name = "ai_skills", columnDefinition = "TEXT")
    private String aiSkills;

    @Column(name = "ai_questions", columnDefinition = "TEXT")
    private String aiQuestions;

    @Column(name = "ai_match_score")
    private Integer aiMatchScore;

    @Column(name = "ai_match_gaps", columnDefinition = "TEXT")
    private String aiMatchGaps;

    @Column(name = "oa_date_time")
    private LocalDateTime oaDateTime;

    @Column(name = "interview_date_time")
    private LocalDateTime interviewDateTime;

    @Column(name = "oa_reminder")
    private boolean oaReminder = false;

    @Column(name = "interview_reminder")
    private boolean interviewReminder = false;

    @Column(name = "oa_email_sent")
    private boolean oaEmailSent = false;

    @Column(name = "interview_email_sent")
    private boolean interviewEmailSent = false;

    public Application() {}

    public Application(User user, String companyName, String role, LocalDate applicationDate, String status) {
        this.user = user;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public String getAiSkills() {
        return aiSkills;
    }

    public void setAiSkills(String aiSkills) {
        this.aiSkills = aiSkills;
    }

    public String getAiQuestions() {
        return aiQuestions;
    }

    public void setAiQuestions(String aiQuestions) {
        this.aiQuestions = aiQuestions;
    }

    public Integer getAiMatchScore() {
        return aiMatchScore;
    }

    public void setAiMatchScore(Integer aiMatchScore) {
        this.aiMatchScore = aiMatchScore;
    }

    public String getAiMatchGaps() {
        return aiMatchGaps;
    }

    public void setAiMatchGaps(String aiMatchGaps) {
        this.aiMatchGaps = aiMatchGaps;
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

    public boolean isOaEmailSent() {
        return oaEmailSent;
    }

    public void setOaEmailSent(boolean oaEmailSent) {
        this.oaEmailSent = oaEmailSent;
    }

    public boolean isInterviewEmailSent() {
        return interviewEmailSent;
    }

    public void setInterviewEmailSent(boolean interviewEmailSent) {
        this.interviewEmailSent = interviewEmailSent;
    }
}
