
package com.mycompany.rideapp.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.rideapp.dto.request.AuthenticationRequest;
import com.mycompany.rideapp.dto.request.UserRequest;
import com.mycompany.rideapp.dto.response.ApiResponse;
import com.mycompany.rideapp.dto.response.AuthenticationResponse;
import com.mycompany.rideapp.dto.response.UserResponse;
import com.mycompany.rideapp.service.AuthenticationService;
import com.mycompany.rideapp.service.UserService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AuthenticationController {
    AuthenticationService authenticationService;
    UserService userService;


    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> login(@Valid @RequestBody AuthenticationRequest authenticationRequest) {
        return ApiResponse.<AuthenticationResponse>builder().code(200).results(authenticationService.loginUser(authenticationRequest)).build();
    }


    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@Valid @RequestBody UserRequest userRequest) {
        return ApiResponse.<UserResponse>builder().code(200).results(userService.userRegister(userRequest)).build();

    }




}
