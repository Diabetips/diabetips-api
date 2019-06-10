package fr.diabetips.api.configuration;

import fr.diabetips.api.controller.ErrorController;
import fr.diabetips.api.service.UsersService;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.header.HeaderWriterFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.beans.Expression;
import java.io.IOException;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Value("${diabetips.security.httpsOnly}")
    private boolean httpsOnly;

    private final ErrorController errorController;

    private final UsersService usersService;

    public SecurityConfig(ErrorController errorController, UsersService usersService) {
        this.errorController = errorController;
        this.usersService = usersService;
    }

    @Bean
    public AuthenticationManager authenticationManager()
        throws Exception {
        return super.authenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setMaxAge(3600L); // 1 hour
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth)
            throws Exception {
        auth
                .userDetailsService(usersService)
                .passwordEncoder(passwordEncoder());
    }

    @Override
    protected void configure(HttpSecurity http)
            throws Exception {
        http
                .addFilterBefore(new ExceptionFilter(), HeaderWriterFilter.class)
                .cors().and()
                .securityContext();
        if (httpsOnly) {
            http.requiresChannel()
                    .anyRequest().requiresSecure();
        }

        http
                .csrf().disable()
                .exceptionHandling().disable()
                .formLogin().disable()
                .httpBasic().disable()
                .logout().disable()
                .requestCache().disable();
    }

    class ExceptionFilter extends OncePerRequestFilter {

        @Override
        protected void doFilterInternal(HttpServletRequest request,
                                        HttpServletResponse response,
                                        FilterChain filterChain)
                throws ServletException, IOException {
            try {
                filterChain.doFilter(request, response);
            } catch (RuntimeException ex) {
                try {
                    Expression expr = new Expression(errorController, "handle", new Object[] { ex });
                    expr.execute();
                    ResponseEntity<?> responseEntity = (ResponseEntity<?>) expr.getValue();
                    response.setStatus(responseEntity.getStatusCodeValue());
                    response.getWriter().write(new ObjectMapper().writeValueAsString(responseEntity.getBody()));
                } catch (Exception e) {
                    throw ex; // Rethrow error
                }
            }
        }

    }

}
