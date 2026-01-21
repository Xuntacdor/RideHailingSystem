
package com.example.demo.mapper;

import org.springframework.stereotype.Component;

import com.example.demo.dto.request.UserRequest;
import com.example.demo.dto.response.UserResponse;
import com.example.demo.entity.User;

@Component

public class UserMapper {

    public User toEntity(UserRequest request) {
        if (request == null)
            return null;
        return User.builder()
                .name(request.getName())
                .userName(request.getUserName())
                .phoneNumber(request.getPhoneNumber())
                .password(request.getPassword())
                .role(request.getRole())
                .cccd(request.getCccd())
                .email(request.getEmail())
                .imageUrl(request.getImageUrl())
                .accountType(request.getAccountType())
                .build();
    }

    public UserResponse toResponse(User user) {
        if (user == null)
            return null;
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .userName(user.getUserName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .cccd(user.getCccd())
                .email(user.getEmail())
                .ImageUrl(user.getImageUrl())
                .accountType(user.getAccountType())
                .build();
    }
}