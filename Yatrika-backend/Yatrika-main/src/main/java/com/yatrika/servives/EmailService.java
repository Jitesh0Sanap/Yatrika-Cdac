package com.yatrika.servives;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Yatrika - Password Reset Request");
            helper.setFrom("noreply@yatrika.com"); // Usually should match SMTP username in prod

            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>"
                    + "<h2 style='color: #0D3D26;'>Yatrika Password Reset</h2>"
                    + "<p>Hello,</p>"
                    + "<p>We received a request to reset your password. Click the button below to choose a new one:</p>"
                    + "<div style='text-align: center; margin: 30px 0;'>"
                    + "<a href='" + resetLink + "' style='background-color: #0D3D26; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;'>Reset Password</a>"
                    + "</div>"
                    + "<p>This link will expire in 15 minutes.</p>"
                    + "<p>If you didn't request this, you can safely ignore this email.</p>"
                    + "<p style='color: #888; font-size: 12px; margin-top: 40px;'>&copy; " + java.time.Year.now().getValue() + " Yatrika Hotel Booking</p>"
                    + "</div>";

            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to create email message: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Failed to send email (SMTP error): " + e.getMessage());
        }
    }
}
