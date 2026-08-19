package com.reservas.booking.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reservas.booking.domain.AppUser;
import com.reservas.booking.domain.Role;
import com.reservas.booking.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper;
    private final String frontendUrl;

    public OAuth2LoginSuccessHandler(UserRepository userRepository,
                                     PasswordEncoder passwordEncoder,
                                     JwtService jwtService,
                                     ObjectMapper objectMapper,
                                     @Value("${app.frontend-url:http://localhost:4200}") String frontendUrl) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.objectMapper = objectMapper;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = stringAttribute(oauthUser, "email");
        if (email == null || email.isBlank()) {
            response.sendRedirect(frontendUrl + "/login?oauthError=missing-email");
            return;
        }

        String normalizedEmail = email.trim().toLowerCase();
        AppUser user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseGet(() -> userRepository.save(new AppUser(
                        stringAttribute(oauthUser, "name", normalizedEmail),
                        normalizedEmail,
                        passwordEncoder.encode(UUID.randomUUID().toString()),
                        Role.CUSTOMER
                )));

        String userJson = objectMapper.writeValueAsString(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name()
        ));

        String target = frontendUrl + "/oauth2/callback#token="
                + encode(jwtService.generateToken(user))
                + "&user=" + encode(userJson);
        response.sendRedirect(target);
    }

    private String stringAttribute(OAuth2User user, String key) {
        Object value = user.getAttributes().get(key);
        return value == null ? null : value.toString();
    }

    private String stringAttribute(OAuth2User user, String key, String fallback) {
        String value = stringAttribute(user, key);
        return value == null || value.isBlank() ? fallback : value;
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }
}
