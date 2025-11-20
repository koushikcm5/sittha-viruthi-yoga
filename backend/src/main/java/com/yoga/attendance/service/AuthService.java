package com.yoga.attendance.service;

import com.yoga.attendance.dto.*;
import com.yoga.attendance.entity.User;
import com.yoga.attendance.repository.UserRepository;
import com.yoga.attendance.repository.AttendanceRepository;
import com.yoga.attendance.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    
    public Map<String, Object> login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
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
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = new User();
        user.setName(request.getName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER);
        
        userRepository.save(user);
        return Map.of("message", "Registration successful");
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
    
    public Map<String, String> deleteUser(String username) {
        if ("admin".equals(username)) {
            throw new RuntimeException("Cannot delete admin user");
        }
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Delete attendance records first (cascade should handle this, but being explicit)
        attendanceRepository.deleteByUser(user);
        
        userRepository.delete(user);
        return Map.of("message", "User deleted successfully");
    }
}
