package com.yoga.attendance.service;

import com.yoga.attendance.dto.*;
import com.yoga.attendance.entity.User;
import com.yoga.attendance.repository.UserRepository;
import com.yoga.attendance.repository.AttendanceRepository;
import com.yoga.attendance.repository.PasswordResetTokenRepository;
import com.yoga.attendance.repository.UserLevelRepository;
import com.yoga.attendance.security.JwtUtil;
import com.yoga.attendance.util.InputSanitizer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserLevelRepository userLevelRepository;
    private final com.yoga.attendance.repository.UserProgressRepository userProgressRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final InputSanitizer inputSanitizer;
    
    public Map<String, Object> login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        if (!user.getEmailVerified()) {
            throw new RuntimeException("EMAIL_NOT_VERIFIED");
        }
        
        if (!user.getApproved()) {
            throw new RuntimeException("PENDING_APPROVAL");
        }
        
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole().name());
        response.put("username", user.getUsername());
        response.put("name", user.getName());
        response.put("level", user.getLevel());
        
        return response;
    }
    
    public Map<String, String> register(RegisterRequest request) {
        String username = inputSanitizer.sanitize(request.getUsername());
        String email = inputSanitizer.sanitize(request.getEmail());
        String name = inputSanitizer.sanitize(request.getName());
        String phone = inputSanitizer.sanitize(request.getPhone());
        
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }
        
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = new User();
        user.setName(name);
        user.setUsername(username);
        user.setEmail(email);
        user.setPhone(phone);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER);
        user.setApproved(true);  // Auto-approve for easier testing
        user.setEmailVerified(true);  // Auto-verify for easier testing
        user.setVerificationToken(UUID.randomUUID().toString());
        
        userRepository.save(user);
        
        // Send email asynchronously to avoid blocking registration
        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getVerificationToken());
        } catch (Exception e) {
            // Log error but don't fail registration
            System.err.println("Failed to send verification email: " + e.getMessage());
        }
        
        return Map.of("message", "Registration successful. Please check your email to verify your account.");
    }
    
    public Map<String, String> forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));
        
        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(java.time.LocalDateTime.now().plusHours(1));
        userRepository.save(user);
        
        emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
        
        return Map.of("message", "Password reset link sent to email");
    }
    
    public Map<String, String> resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
        
        if (user.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
        
        return Map.of("message", "Password reset successful");
    }
    
    @Transactional
    public Map<String, String> deleteUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole() == User.Role.ADMIN) {
            throw new RuntimeException("Cannot delete admin user");
        }
        
        try {
            passwordResetTokenRepository.deleteByUser(user);
            passwordResetTokenRepository.flush();
            
            userProgressRepository.deleteByUsername(username);
            userProgressRepository.flush();
            
            userLevelRepository.deleteByUsername(username);
            userLevelRepository.flush();
            
            attendanceRepository.deleteByUser(user);
            attendanceRepository.flush();
            
            userRepository.delete(user);
            userRepository.flush();
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete user: " + e.getMessage());
        }
        
        return Map.of("message", "User deleted successfully");
    }
    
    public List<Map<String, Object>> getPendingUsers() {
        List<User> pendingUsers = userRepository.findByApproved(false);
        return pendingUsers.stream()
            .map(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("name", user.getName());
                userMap.put("username", user.getUsername());
                userMap.put("email", user.getEmail());
                userMap.put("phone", user.getPhone());
                userMap.put("createdAt", user.getCreatedAt());
                return userMap;
            })
            .toList();
    }
    
    public Map<String, String> approveUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setApproved(true);
        userRepository.save(user);
        
        return Map.of("message", "User approved successfully");
    }
    
    public Map<String, String> verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));
        
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
        
        return Map.of("message", "Email verified successfully");
    }
    
    public Map<String, String> resendVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));
        
        if (user.getEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }
        
        user.setVerificationToken(UUID.randomUUID().toString());
        userRepository.save(user);
        emailService.sendVerificationEmail(user.getEmail(), user.getVerificationToken());
        
        return Map.of("message", "Verification email sent");
    }
}
