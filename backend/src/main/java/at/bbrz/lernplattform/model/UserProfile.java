package at.bbrz.lernplattform.model;

public record UserProfile(Long id,
                          Long userId,
                          String displayName,
                          String learningGoal,
                          int dailyMinutes) {}
