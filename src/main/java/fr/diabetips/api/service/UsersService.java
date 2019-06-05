package fr.diabetips.api.service;

import fr.diabetips.api.exception.ApiError;
import fr.diabetips.api.exception.ApiException;
import fr.diabetips.api.model.User;
import fr.diabetips.api.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;
import java.io.UnsupportedEncodingException;
import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.StringJoiner;
import java.util.UUID;

@Service
public class UsersService {

    @Value("${diabetips.mailFrom}")
    private String mailFrom;

    private static final char[] RANDOM_PASSWORD_CHARSET = (
            "abcdefghijklmnopqrstuvwxyz" +
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
            "0123456789"
        ).toCharArray();

    private static final int RANDOM_PASSWORD_LENGTH = 12;

    private final UsersRepository usersRepository;

    private final JavaMailSender mailSender;

    public UsersService(UsersRepository usersRepository, JavaMailSender mailSender) {
        this.usersRepository = usersRepository;
        this.mailSender = mailSender;
    }

    public List<User> getAllUsers(Pageable p) {
        return usersRepository.findAllByDeletedFalse(p).getContent();
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
        Optional<User> optionalUser = usersRepository.findByUidAndDeletedFalse(uid);
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
        user.setDeleted(true);
        usersRepository.save(user);
    }

    public void resetUserPassword(User email) {
        Thread t = new Thread(() -> {
            Validator validator = Validation.buildDefaultValidatorFactory().getValidator();
            Set<ConstraintViolation<User>> violations = validator.validateProperty(email, "email");
            if (!violations.isEmpty())
                return;

            Optional<User> optionalUser = usersRepository.findByEmailAndDeletedFalse(email.getEmail());
            if (optionalUser.isEmpty())
                return;
            User u = optionalUser.get();

            String newPassword = generateRandomPassword(RANDOM_PASSWORD_LENGTH);

            try {
                MimeMessage message = mailSender.createMimeMessage();
                message.setFrom(
                        new InternetAddress(mailFrom, "Diabetips"));
                message.setRecipients(Message.RecipientType.TO, u.getEmail());
                message.setSubject("Reset your password");
                String template =
                        "Hi %s,<br>" +
                        "You've recently requested to reset your password for your Diabetips account.<br>" +
                        "Here is your new password: <pre>%s</pre>" +
                        "Change it as soon as possible!<br><br>" +
                        "Cheers,<br>" +
                        "The Diabeteam";
                message.setText(String.format(template, u.getFirstName(), newPassword), "utf-8", "html");

                mailSender.send(message);
            } catch (MessagingException | UnsupportedEncodingException e) {
                e.printStackTrace();
                return;
            }

            u.setPassword(BCrypt.hashpw(newPassword, BCrypt.gensalt()));
            usersRepository.save(u);
        });
        t.start();
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

    private String generateRandomPassword(int length) {
        SecureRandom random = new SecureRandom();
        StringBuilder builder = new StringBuilder();
        while (length-- > 0)
            builder.append(RANDOM_PASSWORD_CHARSET[random.nextInt(RANDOM_PASSWORD_CHARSET.length)]);
        return builder.toString();
    }

}
