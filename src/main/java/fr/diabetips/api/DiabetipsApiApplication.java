package fr.diabetips.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration;

@SpringBootApplication(exclude = {
        OAuth2ClientAutoConfiguration.class
})
public class DiabetipsApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(DiabetipsApiApplication.class, args);
    }

}
