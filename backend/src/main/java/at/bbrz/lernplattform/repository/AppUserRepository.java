package at.bbrz.lernplattform.repository;

import at.bbrz.lernplattform.repository.model.AppUser;
import org.springframework.data.repository.CrudRepository;

public interface AppUserRepository extends CrudRepository<AppUser, Long> {
}
