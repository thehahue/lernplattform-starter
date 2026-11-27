package at.bbrz.lernplattform.model;

public record UserView(Long id,
                       String username,
                       UserProfile profile) {}
