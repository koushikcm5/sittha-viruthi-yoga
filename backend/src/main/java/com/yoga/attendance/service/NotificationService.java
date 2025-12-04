package com.yoga.attendance.service;

import com.yoga.attendance.entity.Notification;
import com.yoga.attendance.entity.DeviceToken;
import com.yoga.attendance.repository.NotificationRepository;
import com.yoga.attendance.repository.DeviceTokenRepository;
import com.yoga.attendance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final UserRepository userRepository;
    
    // Send notification to specific user
    public void sendToUser(String username, String title, String message, String type) {
        // Save to database
        Notification notification = new Notification();
        notification.setUsername(username);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notificationRepository.save(notification);
        
        // Send push notification (implement FCM later)
        sendPushNotification(username, title, message);
    }
    
    // Send notification to all users
    public void sendToAllUsers(String title, String message, String type) {
        userRepository.findAll().forEach(user -> {
            if (!"ADMIN".equals(user.getRole())) {
                sendToUser(user.getUsername(), title, message, type);
            }
        });
    }
    
    // Send notification to admin
    public void sendToAdmin(String title, String message, String type) {
        userRepository.findAll().forEach(user -> {
            if ("ADMIN".equals(user.getRole())) {
                sendToUser(user.getUsername(), title, message, type);
            }
        });
    }
    
    // Get user notifications
    public List<Notification> getUserNotifications(String username) {
        return notificationRepository.findByUsernameOrderByCreatedAtDesc(username);
    }
    
    // Get unread count
    public long getUnreadCount(String username) {
        return notificationRepository.countByUsernameAndReadFalse(username);
    }
    
    // Mark as read
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }
    
    // Mark all as read
    public void markAllAsRead(String username) {
        List<Notification> notifications = notificationRepository.findByUsernameAndReadFalseOrderByCreatedAtDesc(username);
        notifications.forEach(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }
    
    // Save device token
    public void saveDeviceToken(String username, String token, String deviceType) {
        DeviceToken deviceToken = deviceTokenRepository
            .findByUsernameAndToken(username, token)
            .orElse(new DeviceToken());
        deviceToken.setUsername(username);
        deviceToken.setToken(token);
        deviceToken.setDeviceType(deviceType);
        deviceTokenRepository.save(deviceToken);
    }
    
    // Send push notification via FCM (placeholder)
    private void sendPushNotification(String username, String title, String message) {
        // TODO: Implement FCM push notification
        // For now, just in-app notifications
    }
}
