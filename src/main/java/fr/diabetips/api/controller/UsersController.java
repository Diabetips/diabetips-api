package fr.diabetips.api.controller;

import fr.diabetips.api.model.User;
import fr.diabetips.api.service.UsersService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
public class UsersController {

    private final UsersService usersService;

    public UsersController(UsersService usersService) {
        this.usersService = usersService;
    }

    /**
     * Gets a list of all registered users
     * @return the list of users
     */
    @GetMapping(path = "/v1/users")
    public List<User> getAllUsers(Pageable p) {
        return usersService.getAllUsers(p);
    }

    /**
     * Create a new user account
     * @param u the user creation form data
     * @return the created user
     */
    @PostMapping(path = "/v1/users")
    @ResponseStatus(HttpStatus.CREATED)
    public User registerUser(@RequestBody User u) {
        return usersService.registerUser(u);
    }

    /**
     * Get the user with the specified uid
     * @param uid the uid of the user to look up
     * @return the user
     */
    @GetMapping(path = "/v1/users/{uid}")
    public User getUser(@PathVariable UUID uid) {
        return usersService.getUser(uid);
    }

    /**
     * Update the user with the specified uid
     * @param uid the uid of the user to update
     * @param newUser the user data to update with
     * @return the updated user
     */
    @PutMapping(path = "/v1/users/{uid}")
    public User updateUser(@PathVariable UUID uid, @RequestBody User newUser) {
        return usersService.updateUser(uid, newUser);
    }

    /**
     * Delete the user with the specified id
     * @param uid the uid of the user to delete
     */
    @DeleteMapping(path = "/v1/users/{uid}")
    public void deleteUser(@PathVariable UUID uid) {
        usersService.deleteUser(uid);
    }

}
