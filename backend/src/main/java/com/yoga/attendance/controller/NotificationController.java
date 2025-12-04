package com.yoga.attendance.controller;

import com.yoga.attendance.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NotificationController {
    
    private final NotificationService notificationService;
    
    @GetMapping("/{username}")
    public ResponseEntity<?> getUserNotifications(@PathVariable String username) {
        return ResponseEntity.ok(notificationService.getUserNotifications(username));
    }
    
    @GetMapping("/{username}/unread-count")
    public ResponseEntity<?> getUnreadCount(@PathVariable String username) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(username)));
    }
    
    @PostMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }
    
    @PostMapping("/{username}/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable String username) {
        notificationService.markAllAsRead(username);
        return ResponseEntity.ok(Map.of("message", "All marked as read"));
    }
    
    @PostMapping("/device-token")
    public ResponseEntity<?> saveDeviceToken(@RequestBody Map<String, String> request) {
        notificationService.saveDeviceToken(
            request.get("username"),
            request.get("token"),
            request.get("deviceType")
        );
        return ResponseEntity.ok(Map.of("message", "Device token saved"));
    }
}
