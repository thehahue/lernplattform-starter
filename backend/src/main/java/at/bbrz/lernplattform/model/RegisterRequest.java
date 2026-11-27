package at.bbrz.lernplattform.model;

public record RegisterRequest(String username,
                              String password,
                              String displayName) {}
