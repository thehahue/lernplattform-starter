package at.bbrz.lernplattform.web;

import at.bbrz.lernplattform.model.RegisterRequest;
import at.bbrz.lernplattform.model.UserProfile;
import at.bbrz.lernplattform.model.UserView;
import at.bbrz.lernplattform.repository.AppUserRepository;
import at.bbrz.lernplattform.repository.model.AppUser;
import at.bbrz.lernplattform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class UserController {
    @Autowired
    UserService userService;

    @PostMapping("/auth/register")
    public UserView register(@RequestBody RegisterRequest request) {
        return userService.registerUser(request);
    }
}
