package com.tracker.app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
        System.out.println("\n========================================================");
        System.out.println("📧 PREPARING EMAIL DISPATCH:");
        System.out.println("TO: " + to);
        System.out.println("SUBJECT: " + subject);
        System.out.println("BODY:\n" + body);
        System.out.println("========================================================\n");

        if (mailSender == null) {
            System.out.println("⚠️ SMTP client is not instantiated. Mock email printed to console log above.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("✅ Email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("⚠️ SMTP dispatch failed (using placeholder credentials): " + e.getMessage());
            System.err.println("Mock console email fallback executed successfully.");
        }
    }
}
