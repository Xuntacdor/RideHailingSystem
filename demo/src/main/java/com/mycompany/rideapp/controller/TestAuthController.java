package com.mycompany.rideapp.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.rideapp.dto.response.ApiResponse;
import com.mycompany.rideapp.security.UserPrincipal;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/test")
@Slf4j
public class TestAuthController {

    @GetMapping("/public")
    public ApiResponse<String> publicEndpoint() {
        return ApiResponse.<String>builder()
                .code(200)
                .results("This is a public endpoint")
                .build();
    }

    @GetMapping("/authenticated")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Object> authenticatedEndpoint() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        
        log.info("User ID: {}", principal.getId());
        log.info("User Email: {}", principal.getEmail());
        log.info("User Role: {}", principal.getRole());
        log.info("Authorities: {}", auth.getAuthorities());
        
        return ApiResponse.<Object>builder()
                .code(200)
                .results(new Object() {
                    public final String userId = principal.getId();
                    public final String email = principal.getEmail();
                    public final String role = principal.getRole() != null ? principal.getRole().name() : "NULL";
                    public final Object authorities = auth.getAuthorities();
                })
                .build();
    }

    @GetMapping("/admin-only")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> adminOnlyEndpoint() {
        return ApiResponse.<String>builder()
                .code(200)
                .results("You are an ADMIN!")
                .build();
    }

    @GetMapping("/user-only")
    @PreAuthorize("hasRole('USER')")
    public ApiResponse<String> userOnlyEndpoint() {
        return ApiResponse.<String>builder()
                .code(200)
                .results("You are a USER!")
                .build();
    }

    @GetMapping("/driver-only")
    @PreAuthorize("hasRole('DRIVER')")
    public ApiResponse<String> driverOnlyEndpoint() {
        return ApiResponse.<String>builder()
                .code(200)
                .results("You are a DRIVER!")
                .build();
    }

    @GetMapping("/user-or-driver")
    @PreAuthorize("hasRole('USER') or hasRole('DRIVER')")
    public ApiResponse<String> userOrDriverEndpoint() {
        return ApiResponse.<String>builder()
                .code(200)
                .results("You are either USER or DRIVER!")
                .build();
    }
}
