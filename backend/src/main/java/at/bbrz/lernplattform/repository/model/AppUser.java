package at.bbrz.lernplattform.repository.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("APP_USER")
public record AppUser(@Id Long id, @Column("USER_NAME") String userName, String passwordHash) {
}
