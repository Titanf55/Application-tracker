package com.tracker.app.repository;

import com.tracker.app.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByUserId(Long userId);
    List<Application> findByStatusAndOaReminderAndOaEmailSent(String status, boolean oaReminder, boolean oaEmailSent);
    List<Application> findByStatusAndInterviewReminderAndInterviewEmailSent(String status, boolean interviewReminder, boolean interviewEmailSent);
}
