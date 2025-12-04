package com.yoga.attendance.controller;

import com.yoga.attendance.entity.User;
import com.yoga.attendance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/fix")
@CrossOrigin(origins = "*")
public class FixController {
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping("/verify-all-users")
    public ResponseEntity<?> verifyAllUsers() {
        try {
            var users = userRepository.findAll();
            int count = 0;
            for (User user : users) {
                if (!user.getEmailVerified()) {
                    user.setEmailVerified(true);
                    userRepository.save(user);
                    count++;
                }
            }
            return ResponseEntity.ok(Map.of("message", count + " users verified"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
