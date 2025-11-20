package com.yoga.attendance.service;

import com.yoga.attendance.dto.AttendanceRequest;
import com.yoga.attendance.entity.Attendance;
import com.yoga.attendance.entity.User;
import com.yoga.attendance.repository.AttendanceRepository;
import com.yoga.attendance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    
    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    
    public Map<String, Object> markAttendance(String username, AttendanceRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        
        Optional<Attendance> existing = attendanceRepository.findByUserAndAttendanceDateBetween(
                user, startOfDay, endOfDay);
        
        if (existing.isPresent()) {
            throw new RuntimeException("Attendance already marked for today");
        }
        
        Attendance attendance = new Attendance();
        attendance.setUser(user);
        attendance.setAttendanceDate(LocalDateTime.now());
        attendance.setAttended(request.getAttended());
        attendance.setLevel(user.getLevel());
        attendance.setDeviceInfo(request.getDeviceInfo());
        
        attendanceRepository.save(attendance);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Attendance marked successfully");
        response.put("level", user.getLevel());
        return response;
    }
    
    public List<Map<String, Object>> getUserAttendance(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Attendance> attendances = attendanceRepository.findByUserOrderByAttendanceDateDesc(user);
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (Attendance att : attendances) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", att.getId());
            map.put("date", att.getAttendanceDate());
            map.put("attended", att.getAttended());
            map.put("level", att.getLevel());
            map.put("deviceInfo", att.getDeviceInfo());
            result.add(map);
        }
        
        return result;
    }
    
    public List<Map<String, Object>> getAllAttendance() {
        List<Attendance> attendances = attendanceRepository.findAllByOrderByAttendanceDateDesc();
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (Attendance att : attendances) {
            // Exclude admin user attendance
            if (!"admin".equals(att.getUser().getUsername())) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", att.getId());
                map.put("username", att.getUser().getUsername());
                map.put("name", att.getUser().getName());
                map.put("date", att.getAttendanceDate());
                map.put("attended", att.getAttended());
                map.put("level", att.getLevel());
                map.put("deviceInfo", att.getDeviceInfo());
                result.add(map);
            }
        }
        
        return result;
    }
    
    public Map<String, Object> updateAttendance(Long id, Boolean attended) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance not found"));
        
        attendance.setAttended(attended);
        attendanceRepository.save(attendance);
        
        return Map.of("message", "Attendance updated successfully");
    }
    
    public List<Map<String, Object>> getAllUsers() {
        List<User> users = userRepository.findAll();
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (User user : users) {
            // Exclude admin user
            if (!"admin".equals(user.getUsername())) {
                Map<String, Object> map = new HashMap<>();
                map.put("username", user.getUsername());
                map.put("name", user.getName());
                map.put("email", user.getEmail());
                map.put("phone", user.getPhone());
                map.put("level", user.getLevel());
                map.put("monthsCompleted", user.getMonthsCompleted());
                map.put("createdAt", user.getCreatedAt());
                result.add(map);
            }
        }
        
        return result;
    }
}
