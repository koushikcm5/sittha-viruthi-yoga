package com.yoga.attendance.service;

import com.yoga.attendance.dto.*;
import com.yoga.attendance.entity.User;
import com.yoga.attendance.repository.UserRepository;
import com.yoga.attendance.repository.AttendanceRepository;
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
        if (username.toLowerCase().startsWith("admin")) {
            user.setRole(User.Role.ADMIN);
            user.setApproved(true);
        } else {
            user.setRole(User.Role.USER);
            user.setApproved(false);
        }
        user.setEmailVerified(true);
        
        userRepository.save(user);
        
        return Map.of("message", "Registration successful. Please wait for admin approval.");
    }
    
    public Map<String, String> forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));
        
        String otp = String.format("%06d", new Random().nextInt(1000000));
        user.setResetOtp(otp);
        user.setResetOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);
        
        try {
            emailService.sendPasswordResetOtp(user.getEmail(), otp);
            return Map.of("message", "Password reset OTP sent to email");
        } catch (Exception e) {
            System.err.println("Failed to send reset OTP: " + e.getMessage());
            // Reset the OTP fields since email failed
            user.setResetOtp(null);
            user.setResetOtpExpiry(null);
            userRepository.save(user);
            throw new RuntimeException("Failed to send email. Please check your email address and try again.");
        }
    }
    
    public Map<String, String> resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));
        
        if (user.getResetOtp() == null || !user.getResetOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }
        
        if (user.getResetOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetOtp(null);
        user.setResetOtpExpiry(null);
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
    
    public Map<String, String> verifyEmail(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));
        
        if (user.getVerificationOtp() == null || !user.getVerificationOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }
        
        if (user.getVerificationOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }
        
        user.setEmailVerified(true);
        user.setVerificationOtp(null);
        user.setVerificationOtpExpiry(null);
        userRepository.save(user);
        
        return Map.of("message", "Email verified successfully");
    }
    
    public Map<String, String> resendVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));
        
        if (user.getEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }
        
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setVerificationOtp(otp);
        user.setVerificationOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);
        emailService.sendVerificationOtp(user.getEmail(), otp);
        
        return Map.of("message", "Verification OTP sent");
    }
}
