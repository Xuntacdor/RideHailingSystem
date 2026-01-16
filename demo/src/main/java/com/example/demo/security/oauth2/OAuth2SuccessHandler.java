package com.example.demo.security.oauth2;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.example.demo.entity.User;
import com.example.demo.enums.Role;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.AuthenticationService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    // @Autowired
    // private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationService authService;
    // @Autowired
    // private JwtService jwtService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        // Extract user information from Google
        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");
        String picture = oauthUser.getAttribute("picture");

        // Find existing user or create new one
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setAccountType("GOOGLE");
            newUser.setName(name);
            newUser.setImageUrl(picture);
            newUser.setRole(Role.USER); // Default role is USER, not DRIVER
            newUser.setUserName(email);
            return userRepository.save(newUser);
        });

        // If user exists, update their information from Google
        if (user.getAccountType().equals("GOOGLE")) {
            user.setName(name);
            user.setImageUrl(picture);
            userRepository.save(user);
        }

        String token = authService.generateTokenFromOAuth2(user);
        String redirectUrl = "http://localhost:5173/oauth2/redirect?token=" + token;
        response.sendRedirect(redirectUrl);
    }
}