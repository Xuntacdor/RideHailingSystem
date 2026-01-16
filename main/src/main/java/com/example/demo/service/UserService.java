
package com.example.demo.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dto.request.UserRequest;
import com.example.demo.dto.response.UserResponse;
import com.example.demo.entity.User;
import com.example.demo.exception.AppException;
import com.example.demo.exception.ErrorCode;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.UserMapper;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.UserPrincipal;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {
    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    MailService mailService;
    ImageStorageService imageStorageService;

    public UserResponse userRegister(UserRequest userRqDto) {
        User user = UserMapper.toEntity(userRqDto);
        if (userRepository.findByEmail(userRqDto.getEmail()).isPresent()) {
        throw new AppException(ErrorCode.USER_EXISTED);
    }   
        if(userRepository.findByUserName(userRqDto.getUserName()).isPresent())
        {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        user.setPassword(passwordEncoder.encode(userRqDto.getPassword()));
        

        userRepository.save(user);
        return UserMapper.toResponse(user);
    }

    public UserResponse getUserInfo(UserRequest userRqDto)
    {
        return userRepository.findByUserName(userRqDto.getUserName()).map(UserMapper::toResponse).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    public UserResponse getUserById(String id)
    {
        return userRepository.findById(id).map(UserMapper::toResponse).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
    
    public UserDetails loadUserById(String id) {
        User user = userRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("User", "id", id)
        );

        return UserPrincipal.create(user);
    }


    public UserResponse uploadAvatar(String userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String path = imageStorageService.storeAvatar(userId, file);

        user.setImageUrl(path);
        userRepository.save(user);
        return UserMapper.toResponse(user);
    }

    public boolean changePassword(String userid, String oldPassword, String newPassword)
    {
        User user = userRepository.findById(userid).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND) );
        if(passwordEncoder.matches(oldPassword, user.getPassword()))
        {
            user.setPassword(passwordEncoder.encode(newPassword));
            return true;
        }
        else return false;
    }
    
    
}