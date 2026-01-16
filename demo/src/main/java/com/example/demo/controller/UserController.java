package com.example.demo.controller;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dto.request.UserRequest;
import com.example.demo.dto.response.ApiResponse;
import com.example.demo.dto.response.UserResponse;
import com.example.demo.enums.AccountStatus;
import com.example.demo.enums.Role;
import com.example.demo.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserController {
    UserService userService;

    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getUserById(@PathVariable String id) {
        log.info("Getting user by ID: {}", id);
        return ApiResponse.<UserResponse>builder()
                .code(200)
                .results(userService.getUserById(id))
                .build();
    }

    @GetMapping("/email/{email}")
    public ApiResponse<UserResponse> getUserByEmail(@PathVariable String email) {
        log.info("Getting user by email: {}", email);
        return ApiResponse.<UserResponse>builder()
                .code(200)
                .results(userService.getUserByEmail(email))
                .build();
    }

    @GetMapping
    public ApiResponse<List<UserResponse>> getAllUsers() {
        log.info("Getting all users");
        return ApiResponse.<List<UserResponse>>builder()
                .code(200)
                .results(userService.getAllUsers())
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<UserResponse> updateUserProfile(
            @PathVariable String id,
            @RequestBody @Validated UserRequest request) {
        log.info("Updating user profile for ID: {}", id);
        return ApiResponse.<UserResponse>builder()
                .code(200)
                .results(userService.updateUserProfile(id, request))
                .build();
    }

    @PutMapping("/{id}/password")
    public ApiResponse<UserResponse> changePassword(
            @PathVariable String id,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        log.info("Changing password for user: {}", id);
        return ApiResponse.<UserResponse>builder()
                .code(200)
                .results(userService.changePassword(id, oldPassword, newPassword))
                .build();
    }

    @PostMapping("/{id}/avatar")
    public ApiResponse<UserResponse> uploadAvatar(
            @PathVariable String id,
            @RequestPart("file") MultipartFile file) {
        log.info("Uploading avatar for user: {}", id);
        return ApiResponse.<UserResponse>builder()
                .code(200)
                .results(userService.uploadAvatar(id, file))
                .build();
    }

    @PutMapping("/{id}/status")
    public ApiResponse<UserResponse> updateAccountStatus(
            @PathVariable String id,
            @RequestParam AccountStatus status) {
        log.info("Updating account status for user: {} to {}", id, status);
        return ApiResponse.<UserResponse>builder()
                .code(200)
                .results(userService.updateAccountStatus(id, status))
                .build();
    }

    @PutMapping("/{id}/role")
    public ApiResponse<UserResponse> updateUserRole(
            @PathVariable String id,
            @RequestParam Role role) {
        log.info("Updating role for user: {} to {}", id, role);
        return ApiResponse.<UserResponse>builder()
                .code(200)
                .results(userService.updateUserRole(id, role))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteUser(@PathVariable String id) {
        log.info("Deleting user: {}", id);
        userService.deleteUser(id);
        return ApiResponse.<String>builder()
                .code(200)
                .results("User deleted successfully")
                .build();
    }
}
