package com.yoga.attendance.controller;

import com.yoga.attendance.entity.QA;
import com.yoga.attendance.repository.QARepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/qa")
@CrossOrigin(origins = "*")
public class QAController {
    
    @Autowired
    private QARepository qaRepository;
    
    @PostMapping("/ask")
    public ResponseEntity<?> askQuestion(@RequestBody Map<String, String> request) {
        QA qa = new QA();
        qa.setUsername(request.get("username"));
        qa.setQuestion(request.get("question"));
        qa.setStatus("PENDING");
        qaRepository.save(qa);
        return ResponseEntity.ok(Map.of("message", "Question submitted successfully"));
    }
    
    @GetMapping("/user/{username}")
    public ResponseEntity<List<QA>> getUserQuestions(@PathVariable String username) {
        return ResponseEntity.ok(qaRepository.findByUsernameOrderByCreatedAtDesc(username));
    }
    
    @GetMapping("/admin/all")
    public ResponseEntity<List<QA>> getAllQuestions() {
        return ResponseEntity.ok(qaRepository.findAllByOrderByCreatedAtDesc());
    }
    
    @PutMapping("/admin/answer/{id}")
    public ResponseEntity<?> answerQuestion(@PathVariable Long id, @RequestBody Map<String, String> request) {
        QA qa = qaRepository.findById(id).orElseThrow();
        qa.setAnswer(request.get("answer"));
        qa.setStatus("ANSWERED");
        qa.setAnsweredAt(LocalDateTime.now());
        qaRepository.save(qa);
        return ResponseEntity.ok(Map.of("message", "Answer submitted successfully"));
    }
}
