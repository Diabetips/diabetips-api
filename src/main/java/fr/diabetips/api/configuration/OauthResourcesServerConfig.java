package fr.diabetips.api.configuration;

import fr.diabetips.api.service.UsersService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configurers.ResourceServerSecurityConfigurer;
import org.springframework.security.oauth2.provider.token.TokenStore;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;

@Configuration
@EnableResourceServer
public class OauthResourcesServerConfig extends ResourceServerConfigurerAdapter {

    @Value("${diabetips.security.httpsOnly}")
    private boolean httpsOnly;

    private final TokenStore tokenStore;

    private final UsersService usersService;

    public OauthResourcesServerConfig(TokenStore tokenStore, UsersService usersService) {
        this.tokenStore = tokenStore;
        this.usersService = usersService;
    }

    @Override
    public void configure(ResourceServerSecurityConfigurer resources) throws Exception {
        resources
                .resourceId("diabetips-api")
                .tokenStore(tokenStore);
    }

    @Override
    public void configure(HttpSecurity http) throws Exception {
        http
                .authorizeRequests()
                    .antMatchers("/login").permitAll()
                    .antMatchers("/error").permitAll()
                    .antMatchers(HttpMethod.POST, "/v1/users").permitAll()
                    .antMatchers(HttpMethod.POST, "/v1/reset-password").permitAll()
                    .antMatchers("/**").access("#oauth2.isUser()")
                    .and()
                .cors().and()
                .exceptionHandling().and()
                .formLogin()
                    .successHandler(new SavedRequestAwareAuthenticationSuccessHandler())
                    .and()
                .httpBasic().and()
                .logout().and()
                .rememberMe()
                    .userDetailsService(usersService)
                    .and()
                .requestCache().and()
                .securityContext().and()
                .sessionManagement()
                    .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED);

        if (httpsOnly) {
            http.requiresChannel()
                    .anyRequest().requiresSecure();
        }
        http
                .csrf().disable();
    }

}
