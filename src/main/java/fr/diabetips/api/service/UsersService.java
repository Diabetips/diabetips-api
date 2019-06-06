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

import javax.mail.Address;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
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

    private static final String[] PROPS_USER_EMAIL    = { "email" };
    private static final String[] PROPS_USER_PASSWORD = { "password" };
    private static final String[] PROPS_USER_PROFILE  = { "firstName", "lastName" };

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
        ServiceUtils.validate(u);

        if (usersRepository.countByEmailAndDeletedFalse(u.getEmail()) > 0)
            throw new ApiException(ApiError.EMAIL_ALREADY_TAKEN);

        new Thread(() -> {
            String template = "<h3>Welcome %s,</h3>" +
                    "Thanks for registering with Diabetips. We’re thrilled to have you on board!<br><br>" +
                    "For reference, here's your login information:<br>" +
                    "<pre>Email: %s</pre><br>" +
                    "Cheers,<br>" +
                    "The Diabeteam";
           sendMailToUser(u, "Welcome to Diabetips!", template, u.getFirstName(), u.getEmail());
        }).start();

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
        User u = getUser(uid);

        // Process profile changes first to have correct info in emails
        ServiceUtils.validateNonNull(newUser, PROPS_USER_PROFILE);
        ServiceUtils.copyNonNullProperties(newUser, u, PROPS_USER_PROFILE);

        if (ServiceUtils.isPropertyNonNull(newUser, PROPS_USER_EMAIL) &&
            !newUser.getEmail().equals(u.getEmail())) {
            ServiceUtils.validate(newUser, PROPS_USER_EMAIL);

            if (usersRepository.countByEmailAndDeletedFalse(newUser.getEmail()) > 0)
                throw new ApiException(ApiError.EMAIL_ALREADY_TAKEN);

            new Thread(() ->  {
                String template = "<h3>Hi %s</h3>" +
                        "The email for your Diabetips account was changed from %s.<br>" +
                        "Your new email is %s.<br><br>" +
                        "If you didn't change your Diabetips account email address, please contact our support to revert this change.<br><br>" +
                        "Cheers,<br>" +
                        "The Diabetips Team";
                sendMailTo(new String[] { u.getEmail(), newUser.getEmail() }, "Email changed",
                        template, u.getFirstName(), u.getEmail(), newUser.getEmail());
            }).start();

            ServiceUtils.copyProperties(newUser, u, PROPS_USER_EMAIL);
        }

        if (ServiceUtils.isPropertyNonNull(newUser, PROPS_USER_PASSWORD) &&
            !BCrypt.checkpw(newUser.getPassword(), u.getPassword())) {
            ServiceUtils.validate(newUser, PROPS_USER_PASSWORD);

            new Thread(() ->  {
                String template = "<h3>Hi %s</h3>" +
                        "The password for your Diabetips account was recently changed.<br><br>" +
                        "If you didn't change your Diabetips account password, please contact our support to revert this change.<br><br>" +
                        "Cheers,<br>" +
                        "The Diabetips Team";
                sendMailToUser(u, "Password changed", template, u.getFirstName());
            }).start();

            u.setPassword(BCrypt.hashpw(newUser.getPassword(), BCrypt.gensalt()));
        }

        return usersRepository.save(u);
    }

    public void deleteUser(UUID uid) {
        User user = getUser(uid);
        user.setDeleted(true);
        usersRepository.save(user);
    }

    public void resetUserPassword(User email) {
        new Thread(() -> {
            Optional<User> optionalUser = usersRepository.findByEmailAndDeletedFalse(email.getEmail());
            if (optionalUser.isEmpty())
                return;
            User u = optionalUser.get();

            String newPassword = generateRandomPassword(RANDOM_PASSWORD_LENGTH);

            String template = "<h3>Hi %s,</h3>" +
                    "You've recently requested to reset your password for your Diabetips account.<br>" +
                    "Here is your new password:" +
                    "<pre>%s</pre>" +
                    "Change it as soon as possible!<br><br>" +
                    "Cheers,<br>" +
                    "The Diabetips Team";
            if (!sendMailToUser(u, "Password reset", template, u.getFirstName(), newPassword))
                return;

            u.setPassword(BCrypt.hashpw(newPassword, BCrypt.gensalt()));
            usersRepository.save(u);
        }).start();
    }

    private String generateRandomPassword(int length) {
        SecureRandom random = new SecureRandom();
        StringBuilder builder = new StringBuilder();
        while (length-- > 0)
            builder.append(RANDOM_PASSWORD_CHARSET[random.nextInt(RANDOM_PASSWORD_CHARSET.length)]);
        return builder.toString();
    }

    private boolean sendMailToUser(User u, String subject, String template, Object... args) {
        return sendMailTo(new String[] { u.getEmail() }, subject, template, args);
    }

    private boolean sendMailTo(String[] to, String subject, String template, Object... args) {
        try {
            List<Address> addresses = new ArrayList<>();
            for (String address : to)
                addresses.add(new InternetAddress(address));

            MimeMessage message = mailSender.createMimeMessage();
            message.setFrom(new InternetAddress(mailFrom, "Diabetips"));
            message.setRecipients(Message.RecipientType.TO, addresses.toArray(new Address[0]));
            message.setSubject(subject);
            message.setText(String.format(template, args), "utf-8", "html");
            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException e) {
            e.printStackTrace();
            return false;
        }
        return true;
    }

}
