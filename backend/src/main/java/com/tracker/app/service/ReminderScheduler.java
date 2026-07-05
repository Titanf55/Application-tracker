package com.tracker.app.service;

import com.tracker.app.model.Application;
import com.tracker.app.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ReminderScheduler {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private EmailService emailService;

    // Runs 5 seconds after startup, and then every 10 minutes (600,000 milliseconds)
    @Scheduled(initialDelay = 5000, fixedRate = 600000)
    @Transactional
    public void checkUpcomingReminders() {
        System.out.println("⏰ [Scheduler] Running upcoming assessment and interview reminder check...");
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime twoHoursLater = now.plusHours(2);

        // 1. Process OA Received Reminders
        List<Application> pendingOas = applicationRepository.findByStatusAndOaReminderAndOaEmailSent("OA Received", true, false);
        for (Application app : pendingOas) {
            if (app.getOaDateTime() != null) {
                // If the scheduled OA is in the future, and is less than or equal to 2 hours away
                if (app.getOaDateTime().isAfter(now) && !app.getOaDateTime().isAfter(twoHoursLater)) {
                    long minutesLeft = ChronoUnit.MINUTES.between(now, app.getOaDateTime());
                    String subject = "Upcoming OA Reminder: " + app.getCompanyName();
                    String body = String.format("Hi %s,\n\nThis is a reminder that your Online Assessment for %s (%s) is scheduled in %d minutes at %s.\n\nGood luck!\n\nBest,\nInternship Tracker Team",
                            app.getUser().getUsername(), app.getCompanyName(), app.getRole(), minutesLeft, app.getOaDateTime());
                    
                    emailService.sendEmail(app.getUser().getEmail(), subject, body);
                    
                    app.setOaEmailSent(true);
                    applicationRepository.save(app);
                }
            }
        }

        // 2. Process Interview Scheduled Reminders
        List<Application> pendingInterviews = applicationRepository.findByStatusAndInterviewReminderAndInterviewEmailSent("Interview Scheduled", true, false);
        for (Application app : pendingInterviews) {
            if (app.getInterviewDateTime() != null) {
                // If scheduled Interview is in the future, and is less than or equal to 2 hours away
                if (app.getInterviewDateTime().isAfter(now) && !app.getInterviewDateTime().isAfter(twoHoursLater)) {
                    long minutesLeft = ChronoUnit.MINUTES.between(now, app.getInterviewDateTime());
                    String subject = "Upcoming Interview Reminder: " + app.getCompanyName();
                    String body = String.format("Hi %s,\n\nThis is a reminder that your interview with %s for the %s role is scheduled in %d minutes at %s.\n\nGood luck!\n\nBest,\nInternship Tracker Team",
                            app.getUser().getUsername(), app.getCompanyName(), app.getRole(), minutesLeft, app.getInterviewDateTime());
                    
                    emailService.sendEmail(app.getUser().getEmail(), subject, body);
                    
                    app.setInterviewEmailSent(true);
                    applicationRepository.save(app);
                }
            }
        }
    }
}
