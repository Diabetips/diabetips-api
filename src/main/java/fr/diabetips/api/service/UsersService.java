package fr.diabetips.api.service;

import fr.diabetips.api.exception.ApiError;
import fr.diabetips.api.exception.ApiException;
import fr.diabetips.api.model.User;
import fr.diabetips.api.repository.UsersRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.StringJoiner;
import java.util.UUID;

@Service
public class UsersService {

    private final UsersRepository usersRepository;

    public UsersService(UsersRepository usersRepository) {
        this.usersRepository = usersRepository;
    }

    public List<User> getAllUsers(Pageable p) {
        return usersRepository.findAll(p).getContent();
    }

    public User registerUser(User u) {
        validateUser(u);

        if (usersRepository.countByEmailAndDeletedFalse(u.getEmail()) > 0)
            throw new ApiException(ApiError.EMAIL_ALREADY_TAKEN);

        u.setUid(UUID.randomUUID());
        u.setPassword(BCrypt.hashpw(u.getPassword(), BCrypt.gensalt()));
        return usersRepository.save(u);
    }

    public User getUser(UUID uid) {
        Optional<User> optionalUser = usersRepository.findByUid(uid);
        if (optionalUser.isEmpty())
            throw new ApiException(ApiError.USER_NOT_FOUND, "User '" + uid + "' not found");
        return optionalUser.get();
    }

    public User updateUser(UUID uid, User newUser) {
        User oldUser = getUser(uid);
        validateUser(newUser);

        // Manually copy properties for now, TODO: check permissions + send confirm email, etc
        oldUser.setEmail(newUser.getEmail());
        oldUser.setPassword(BCrypt.hashpw(newUser.getPassword(), BCrypt.gensalt()));
        oldUser.setFirstName(newUser.getFirstName());
        oldUser.setLastName(newUser.getLastName());

        return usersRepository.save(oldUser);
    }

    public void deleteUser(UUID uid) {
        User user = getUser(uid);

        // Actually delete the user for now
        /*
        user.setDeleted(true);
        usersRepository.save(user);
        */
        usersRepository.delete(user);
    }


    private void validateUser(User u) {
        Validator validator = Validation.buildDefaultValidatorFactory().getValidator();
        Set<ConstraintViolation<User>> violations = validator.validate(u);
        if (!violations.isEmpty()) {
            StringJoiner joiner = new StringJoiner(", ");
            for (ConstraintViolation<User> violation : violations)
                joiner.add(violation.getMessage());
            throw new ApiException(ApiError.VALIDATION_ERROR, "Validation error: " + joiner.toString());
        }
    }
}
