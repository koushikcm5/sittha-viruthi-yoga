package com.yoga.attendance.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance")
@Data
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private LocalDateTime attendanceDate;
    
    @Column(nullable = false)
    private Boolean attended;
    
    @Column(nullable = false)
    private Integer level;
    
    @Column(nullable = false)
    private String deviceInfo;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
