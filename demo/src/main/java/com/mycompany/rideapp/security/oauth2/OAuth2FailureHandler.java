package com.mycompany.rideapp.security.oauth2;


import java.io.IOException;
 
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
 
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
 
@Component
@Slf4j
public class OAuth2FailureHandler implements AuthenticationFailureHandler {
 
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException exception) throws IOException, ServletException {
        log.error("OAuth2 authentication failed: {}", exception.getMessage());
        // Redirect to frontend error page
        String redirectUrl = "http://localhost:5173/login?error=" + exception.getMessage();
        response.sendRedirect(redirectUrl);
    }
}