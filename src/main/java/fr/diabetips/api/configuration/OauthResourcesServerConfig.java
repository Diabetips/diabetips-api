package fr.diabetips.api.configuration;

import fr.diabetips.api.controller.ErrorController;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configurers.ResourceServerSecurityConfigurer;
import org.springframework.security.oauth2.provider.token.TokenStore;

@Configuration
@EnableResourceServer
public class OauthResourcesServerConfig extends ResourceServerConfigurerAdapter {

    private final TokenStore tokenStore;

    public OauthResourcesServerConfig(TokenStore tokenStore) {
        this.tokenStore = tokenStore;
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
                .antMatchers(ErrorController.ERROR_PATH).permitAll()
                .antMatchers(HttpMethod.POST, "/v1/users").permitAll()
                .antMatchers("/**").access("#oauth2.isUser()");
    }
}
