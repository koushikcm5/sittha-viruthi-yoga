package com.yoga.attendance.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    public void sendVerificationEmail(String to, String token) {
        try {
            System.out.println("\n=== EMAIL VERIFICATION ===");
            System.out.println("To: " + to);
            System.out.println("Token: " + token);
            System.out.println("========================\n");
            
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true);
                
                helper.setTo(to);
                helper.setSubject("Verify your Yoga App email");
                helper.setText(getVerificationEmailTemplate(token), true);
                
                mailSender.send(message);
                System.out.println("Verification email sent to: " + to);
            } catch (Exception emailError) {
                System.out.println("Email sending failed: " + emailError.getMessage());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to process email", e);
        }
    }
    
    public void sendPasswordResetEmail(String to, String token) {
        try {
            String resetLink = "http://10.10.42.68:9000/reset-password.html?token=" + token;
            System.out.println("\n=== PASSWORD RESET EMAIL ===");
            System.out.println("To: " + to);
            System.out.println("Reset Link: " + resetLink);
            System.out.println("Token: " + token);
            System.out.println("============================\n");
            
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true);
                
                helper.setTo(to);
                helper.setSubject("Reset your Yoga App password");
                helper.setText(getResetEmailTemplate(token), true);
                
                mailSender.send(message);
                System.out.println("Email sent successfully to: " + to);
            } catch (Exception emailError) {
                System.out.println("Email sending failed: " + emailError.getMessage());
                System.out.println("Use the reset link from console output above");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to process email", e);
        }
    }
    
    private String getResetEmailTemplate(String token) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                ".token-box { background-color: #f0f0f0; padding: 15px; border-radius: 5px; font-size: 16px; font-weight: bold; text-align: center; margin: 20px 0; color: #000; word-break: break-all; }" +
                "</style></head>" +
                "<body style='font-family: Arial, sans-serif; padding: 20px;'>" +
                "<h2>Reset Your Password</h2>" +
                "<p>Copy the token below and paste it in the app to reset your password:</p>" +
                "<div class='token-box'>" + token + "</div>" +
                "<p><strong>Steps:</strong></p>" +
                "<ol>" +
                "<li>Open the Yoga App</li>" +
                "<li>Go to Forgot Password screen</li>" +
                "<li>Enter your email and click Send Reset Link</li>" +
                "<li>Copy and paste the token above</li>" +
                "<li>Enter your new password</li>" +
                "</ol>" +
                "<p>This token will expire in 15 minutes.</p>" +
                "<p>If you didn't request this, please ignore this email.</p>" +
                "</body>" +
                "</html>";
    }
    
    private String getVerificationEmailTemplate(String token) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                ".token-box { background-color: #f0f0f0; padding: 15px; border-radius: 5px; font-size: 16px; font-weight: bold; text-align: center; margin: 20px 0; color: #000; word-break: break-all; }" +
                "</style></head>" +
                "<body style='font-family: Arial, sans-serif; padding: 20px;'>" +
                "<h2>Verify Your Email</h2>" +
                "<p>Copy the token below and paste it in the app to verify your email:</p>" +
                "<div class='token-box'>" + token + "</div>" +
                "<p><strong>Steps:</strong></p>" +
                "<ol>" +
                "<li>Open the Yoga App</li>" +
                "<li>Go to Email Verification screen</li>" +
                "<li>Paste the token above</li>" +
                "<li>Click Verify</li>" +
                "</ol>" +
                "<p>If you didn't register, please ignore this email.</p>" +
                "</body>" +
                "</html>";
    }
}
