package at.bbrz.lernplattform.service;

import at.bbrz.lernplattform.model.RegisterRequest;
import at.bbrz.lernplattform.model.UserView;
import at.bbrz.lernplattform.repository.AppUserRepository;
import at.bbrz.lernplattform.repository.model.AppUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    AppUserRepository appUserRepository;

    @Autowired
    HashService hashService;

    public UserView registerUser(RegisterRequest request) {
        String hashedPassword = hashService.hashPassword(request.password());
        AppUser newAppUser = appUserRepository.save(new AppUser(null, request.username(), hashedPassword));

        UserView newUserView = new UserView(newAppUser.id(), newAppUser.userName(), null);

        return newUserView;
    }
}
