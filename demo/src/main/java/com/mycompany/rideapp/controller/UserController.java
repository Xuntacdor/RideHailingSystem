package com.mycompany.rideapp.controller;

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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import com.mycompany.rideapp.dto.request.UserRequest;
import com.mycompany.rideapp.dto.response.ApiResponse;
import com.mycompany.rideapp.dto.response.UserResponse;
import com.mycompany.rideapp.enums.AccountStatus;
import com.mycompany.rideapp.enums.Role;
import com.mycompany.rideapp.service.UserService;

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
                return ApiResponse.<UserResponse>builder()
                                .code(200)
                                .results(userService.getUserById(id))
                                .build();
        }

        @GetMapping("/email/{email}")
        public ApiResponse<UserResponse> getUserByEmail(@PathVariable String email) {
                return ApiResponse.<UserResponse>builder()
                                .code(200)
                                .results(userService.getUserByEmail(email))
                                .build();
        }

        // @GetMapping
        // public ApiResponse<List<UserResponse>> getAllUsers() {
        //         return ApiResponse.<List<UserResponse>>builder()
        //                         .code(200)
        //                         .results(userService.getAllUsers())
        //                         .build();
        // }

        @PutMapping("/{id}")
        public ApiResponse<UserResponse> updateUserProfile(
                        @PathVariable String id,
                        @RequestBody @Validated UserRequest request) {
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
                return ApiResponse.<UserResponse>builder()
                                .code(200)
                                .results(userService.changePassword(id, oldPassword, newPassword))
                                .build();
        }

        @PostMapping("/{id}/avatar")
        public ApiResponse<UserResponse> uploadAvatar(
                        @PathVariable String id,
                        @RequestPart("file") MultipartFile file) {
                return ApiResponse.<UserResponse>builder()
                                .code(200)
                                .results(userService.uploadAvatar(id, file))
                                .build();
        }

        @PutMapping("/{id}/status")
        public ApiResponse<UserResponse> updateAccountStatus(
                        @PathVariable String id,
                        @RequestParam AccountStatus status) {
                return ApiResponse.<UserResponse>builder()
                                .code(200)
                                .results(userService.updateAccountStatus(id, status))
                                .build();
        }

        @PutMapping("/{id}/role")
        public ApiResponse<UserResponse> updateUserRole(
                        @PathVariable String id,
                        @RequestParam Role role) {
                return ApiResponse.<UserResponse>builder()
                                .code(200)
                                .results(userService.updateUserRole(id, role))
                                .build();
        }

        @DeleteMapping("/{id}")
        public ApiResponse<String> deleteUser(@PathVariable String id) {
                userService.deleteUser(id);
                return ApiResponse.<String>builder()
                                .code(200)
                                .results("User deleted successfully")
                                .build();
        }
        @GetMapping
        public Page<UserResponse> getUsers(
                        @RequestParam int page,
                        @RequestParam int size) {
                return userService.getUsers(PageRequest.of(page, size));
        }
        @GetMapping("/find")
        public ApiResponse<List<UserResponse>> searchUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String keyword) {
            
                return ApiResponse.<List<UserResponse>>builder()
                        .code(200)
                        .results(userService.searchAndFilterUsers(role, keyword))
                        .build();
    }

}
