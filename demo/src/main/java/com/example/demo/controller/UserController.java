package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dto.response.ApiResponse;
import com.example.demo.dto.response.UserResponse;
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

    @GetMapping("/info/{id}")
    public ApiResponse<UserResponse> getUserInfo(@PathVariable String id) {
        return ApiResponse.<UserResponse>builder().code(200).results(userService.getUserById(id)).build();
    }

    @PostMapping("upload/{id}")
    public ApiResponse<UserResponse> uploadImage(@PathVariable String id, @RequestPart("file") MultipartFile file)
    {
        return ApiResponse.<UserResponse>builder().code(200).results(userService.uploadAvatar(id, file)).build();
    }
}
