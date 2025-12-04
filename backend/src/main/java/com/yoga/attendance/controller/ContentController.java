package com.yoga.attendance.controller;

import com.yoga.attendance.entity.*;
import com.yoga.attendance.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/content")
@CrossOrigin(origins = "*")
public class ContentController {

    @Autowired private VideoRepository videoRepository;
    @Autowired private UserLevelRepository userLevelRepository;
    @Autowired private DailyRoutineRepository dailyRoutineRepository;
    @Autowired private HabitTaskRepository habitTaskRepository;
    @Autowired private UserProgressRepository userProgressRepository;
    @Autowired private WorkshopRepository workshopRepository;
    @Autowired private ManifestationVideoRepository manifestationVideoRepository;


    // Get user's current level and video
    @GetMapping("/user/{username}")
    public ResponseEntity<?> getUserContent(@PathVariable String username) {
        UserLevel userLevel = userLevelRepository.findByUsername(username)
            .orElseGet(() -> {
                UserLevel newLevel = new UserLevel();
                newLevel.setUsername(username);
                newLevel.setLevel(1);
                newLevel.setCurrentVideoIndex(0);
                return userLevelRepository.save(newLevel);
            });
        
        List<Video> videos = videoRepository.findByLevelAndActiveTrueOrderByIdAsc(userLevel.getLevel());
        Video currentVideo = videos.isEmpty() ? null : videos.get(Math.min(userLevel.getCurrentVideoIndex(), videos.size() - 1));
        
        Map<String, Object> response = new HashMap<>();
        response.put("level", userLevel.getLevel());
        response.put("currentVideoIndex", userLevel.getCurrentVideoIndex());
        response.put("currentVideo", currentVideo);
        response.put("totalVideos", videos.size());
        
        return ResponseEntity.ok(response);
    }

    // Get daily routines
    @GetMapping("/routines")
    public ResponseEntity<?> getDailyRoutines() {
        return ResponseEntity.ok(dailyRoutineRepository.findByActiveTrueOrderBySequenceAsc());
    }

    // Get habit tasks
    @GetMapping("/habits")
    public ResponseEntity<?> getHabitTasks() {
        return ResponseEntity.ok(habitTaskRepository.findByActiveTrue());
    }

    // Mark video complete
    @PostMapping("/complete-video")
    public ResponseEntity<?> completeVideo(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        
        UserProgress progress = getOrCreateProgress(username);
        progress.setVideoCompleted(true);
        progress.setCompletedVideoId(Long.parseLong(request.getOrDefault("videoId", "0")));
        userProgressRepository.save(progress);
        
        return ResponseEntity.ok(Map.of("message", "Video completed"));
    }

    // Mark routine complete
    @PostMapping("/complete-routine")
    public ResponseEntity<?> completeRoutine(@RequestBody Map<String, String> request) {
        UserProgress progress = getOrCreateProgress(request.get("username"));
        progress.setRoutineCompleted(true);
        progress.setAllTasksCompleted(true);
        userProgressRepository.save(progress);
        return ResponseEntity.ok(Map.of("message", "Routine completed"));
    }

    // Mark habits complete
    @PostMapping("/complete-habits")
    public ResponseEntity<?> completeHabits(@RequestBody Map<String, String> request) {
        UserProgress progress = getOrCreateProgress(request.get("username"));
        progress.setHabitsCompleted(true);
        progress.setAllTasksCompleted(true);
        userProgressRepository.save(progress);
        return ResponseEntity.ok(Map.of("message", "Habits completed"));
    }

    // Mark Q&A complete
    @PostMapping("/complete-qa")
    public ResponseEntity<?> completeQA(@RequestBody Map<String, String> request) {
        UserProgress progress = getOrCreateProgress(request.get("username"));
        progress.setQaCompleted(true);
        progress.setAllTasksCompleted(true);
        userProgressRepository.save(progress);
        return ResponseEntity.ok(Map.of("message", "Q&A completed"));
    }

    // Get today's progress
    @GetMapping("/progress/{username}")
    public ResponseEntity<?> getProgress(@PathVariable String username) {
        UserProgress progress = getOrCreateProgress(username);
        return ResponseEntity.ok(progress);
    }

    // Admin: Get all users progress for today
    @GetMapping("/admin/progress")
    public ResponseEntity<?> getAllProgress() {
        return ResponseEntity.ok(userProgressRepository.findByDateOrderByUsernameAsc(LocalDate.now()));
    }

    // Admin: Add video
    @PostMapping("/admin/video")
    public ResponseEntity<?> addVideo(@RequestBody Video video) {
        return ResponseEntity.ok(videoRepository.save(video));
    }

    // Admin: Add routine
    @PostMapping("/admin/routine")
    public ResponseEntity<?> addRoutine(@RequestBody DailyRoutine routine) {
        return ResponseEntity.ok(dailyRoutineRepository.save(routine));
    }

    // Admin: Add habit
    @PostMapping("/admin/habit")
    public ResponseEntity<?> addHabit(@RequestBody HabitTask habit) {
        return ResponseEntity.ok(habitTaskRepository.save(habit));
    }
    
    // Admin: Update habit
    @PutMapping("/admin/habit/{id}")
    public ResponseEntity<?> updateHabit(@PathVariable Long id, @RequestBody HabitTask habitData) {
        try {
            HabitTask habit = habitTaskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Habit not found"));
            habit.setName(habitData.getName());
            habit.setDescription(habitData.getDescription());
            habit.setActive(true);
            return ResponseEntity.ok(habitTaskRepository.save(habit));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin: Delete habit
    @DeleteMapping("/admin/habit/{id}")
    public ResponseEntity<?> deleteHabit(@PathVariable Long id) {
        try {
            habitTaskRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Habit deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin: Add workshop
    @PostMapping("/admin/workshop")
    public ResponseEntity<?> addWorkshop(@RequestBody Workshop workshop) {
        try {
            System.out.println("Received workshop: " + workshop);
            Workshop saved = workshopRepository.save(workshop);
            System.out.println("Saved workshop with ID: " + saved.getId());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.err.println("Error saving workshop: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Admin: Get all workshops (for testing)
    @GetMapping("/admin/workshops")
    public ResponseEntity<?> getAllWorkshops() {
        return ResponseEntity.ok(workshopRepository.findAll());
    }

    // Get workshops by level (only upcoming, not expired)
    @GetMapping("/workshops/{level}")
    public ResponseEntity<?> getWorkshopsByLevel(@PathVariable Integer level) {
        try {
            List<Workshop> workshops = workshopRepository.findByLevelAndTypeAndActiveTrueAndEndTimeAfterOrderByStartTimeAsc(level, "upcoming", LocalDateTime.now());
            return ResponseEntity.ok(workshops);
        } catch (Exception e) {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }
    
    // Get session workshops by level
    @GetMapping("/workshops/sessions/{level}")
    public ResponseEntity<?> getSessionWorkshops(@PathVariable Integer level) {
        try {
            List<Workshop> sessions = workshopRepository.findByLevelAndTypeAndActiveTrue(level, "session");
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }
    
    // Get recent workshop notifications
    @GetMapping("/workshops/notifications")
    public ResponseEntity<?> getWorkshopNotifications() {
        try {
            List<Workshop> workshops = workshopRepository.findTop5ByActiveTrueOrderByCreatedAtDesc();
            return ResponseEntity.ok(workshops);
        } catch (Exception e) {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    // Get all videos
    @GetMapping("/videos")
    public ResponseEntity<?> getAllVideos() {
        return ResponseEntity.ok(videoRepository.findAllByOrderByLevelAscIdAsc());
    }

    // Get manifestation video
    @GetMapping("/manifestation-video")
    public ResponseEntity<?> getManifestationVideo() {
        Optional<ManifestationVideo> video = manifestationVideoRepository.findFirstByOrderByIdDesc();
        if (video.isPresent()) {
            ManifestationVideo v = video.get();
            Map<String, Object> response = new HashMap<>();
            response.put("id", v.getId());
            response.put("name", v.getName());
            response.put("url", v.getUrl());
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.ok(null);
    }
    
    // Get video URL
    @GetMapping("/video/{id}/url")
    public ResponseEntity<?> getVideoUrl(@PathVariable Long id) {
        Optional<Video> video = videoRepository.findById(id);
        if (video.isPresent()) {
            return ResponseEntity.ok(Map.of("url", video.get().getUrl()));
        }
        return ResponseEntity.notFound().build();
    }

    // Admin: Add or Update manifestation video
    @PostMapping("/admin/manifestation-video")
    public ResponseEntity<?> addOrUpdateManifestationVideo(@RequestBody ManifestationVideo video) {
        Optional<ManifestationVideo> existing = manifestationVideoRepository.findFirstByOrderByIdDesc();
        if (existing.isPresent()) {
            ManifestationVideo existingVideo = existing.get();
            existingVideo.setName(video.getName());
            existingVideo.setUrl(video.getUrl());
            return ResponseEntity.ok(Map.of(
                "message", "Manifestation video updated",
                "video", manifestationVideoRepository.save(existingVideo)
            ));
        } else {
            return ResponseEntity.ok(Map.of(
                "message", "Manifestation video added",
                "video", manifestationVideoRepository.save(video)
            ));
        }
    }

    // Admin: Update user level
    @PostMapping("/admin/user-level")
    public ResponseEntity<?> updateUserLevel(@RequestBody Map<String, Object> request) {
        String username = (String) request.get("username");
        Integer level = (Integer) request.get("level");
        
        UserLevel userLevel = userLevelRepository.findByUsername(username).orElseThrow();
        userLevel.setLevel(level);
        userLevel.setCurrentVideoIndex(0);
        userLevelRepository.save(userLevel);
        
        return ResponseEntity.ok(Map.of("message", "User level updated"));
    }

    // Check if manifestation video exists
    @GetMapping("/admin/manifestation-video-exists")
    public ResponseEntity<?> checkManifestationVideoExists() {
        boolean exists = manifestationVideoRepository.findFirstByOrderByIdDesc().isPresent();
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    // Fix habit tasks - create 5 default if none exist
    @PostMapping("/admin/fix-habits")
    public ResponseEntity<?> fixHabitTasks() {
        try {
            List<HabitTask> existing = habitTaskRepository.findAll();
            if (existing.isEmpty()) {
                for (int i = 1; i <= 5; i++) {
                    HabitTask task = new HabitTask();
                    task.setName("Task " + i);
                    task.setDescription("Complete your daily habit " + i);
                    task.setActive(true);
                    habitTaskRepository.save(task);
                }
                return ResponseEntity.ok(Map.of("message", "5 default tasks created successfully"));
            }
            return ResponseEntity.ok(Map.of("message", "Tasks already exist", "count", existing.size()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private UserProgress getOrCreateProgress(String username) {
        return userProgressRepository.findByUsernameAndDate(username, LocalDate.now())
            .orElseGet(() -> {
                UserProgress progress = new UserProgress();
                progress.setUsername(username);
                progress.setDate(LocalDate.now());
                progress.setVideoCompleted(false);
                progress.setRoutineCompleted(false);
                progress.setHabitsCompleted(false);
                progress.setQaCompleted(false);
                progress.setAllTasksCompleted(false);
                return userProgressRepository.save(progress);
            });
    }


}
