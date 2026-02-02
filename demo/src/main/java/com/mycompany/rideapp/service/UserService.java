
package com.mycompany.rideapp.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.mycompany.rideapp.dto.request.UserRequest;
import com.mycompany.rideapp.dto.response.UserResponse;
import com.mycompany.rideapp.entity.User;
import com.mycompany.rideapp.enums.AccountStatus;
import com.mycompany.rideapp.enums.Role;
import com.mycompany.rideapp.exception.AppException;
import com.mycompany.rideapp.exception.ErrorCode;
import com.mycompany.rideapp.exception.ResourceNotFoundException;
import com.mycompany.rideapp.mapper.UserMapper;
import com.mycompany.rideapp.repository.UserRepository;
import com.mycompany.rideapp.security.UserPrincipal;

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
    UserMapper userMapper;
    AchievementService achievementService;

    public UserResponse userRegister(UserRequest userRqDto) {
        User user = userMapper.toEntity(userRqDto);
        if (userRepository.findByEmail(userRqDto.getEmail()).isPresent()) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        if (userRepository.findByUserName(userRqDto.getUserName()).isPresent()) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        user.setPassword(passwordEncoder.encode(userRqDto.getPassword()));

        userRepository.save(user);

        // Award default coupons to new user
        try {
            achievementService.awardDefaultCoupons(user.getId());
        } catch (Exception e) {
            log.error("Failed to award default coupons to user {}: {}", user.getId(), e.getMessage());
        }

        return userMapper.toResponse(user);
    }

    public UserResponse getUserInfo(UserRequest userRqDto) {
        return userRepository.findByUserName(userRqDto.getUserName()).map(userMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    public UserResponse getUserById(String id) {
        return userRepository.findById(id).map(userMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    public UserDetails loadUserById(String id) {
        User user = userRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("User", "id", id));

        return UserPrincipal.create(user);
    }

    public UserResponse uploadAvatar(String userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String path = imageStorageService.storeAvatar(userId, file);

        user.setImageUrl(path);
        userRepository.save(user);
        return userMapper.toResponse(user);
    }

    public UserResponse updateUserProfile(String userId, UserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getCccd() != null) {
            user.setCccd(request.getCccd());
        }

        userRepository.save(user);
        log.info("User profile updated for ID: {}", userId);
        return userMapper.toResponse(user);
    }

    public UserResponse changePassword(String userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new AppException(ErrorCode.PASSWORD_INVALID);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password changed for user: {}", userId);
        return userMapper.toResponse(user);
    }

    public Page<UserResponse> getUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(userMapper::toResponse);
    }

    public List<UserResponse> getAllUsers() {
        return getUsers(Pageable.unpaged()).getContent();
    }

    public UserResponse getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    public UserResponse updateAccountStatus(String userId, AccountStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setStatus(status);
        userRepository.save(user);

        log.info("Account status updated to {} for user: {}", status, userId);
        return userMapper.toResponse(user);
    }

    public UserResponse updateUserRole(String userId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setRole(role);
        userRepository.save(user);

        log.info("Role updated to {} for user: {}", role, userId);
        return userMapper.toResponse(user);
    }

    public void deleteUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        userRepository.deleteById(userId);
        log.info("User deleted: {}", userId);
    }

    public List<UserResponse> searchAndFilterUsers(String roleName, String keyword) {

        Role roleEnum = null;
        if (roleName != null && !roleName.trim().isEmpty()) {
            try {

                roleEnum = Role.valueOf(roleName.toUpperCase());
            } catch (IllegalArgumentException e) {

                roleEnum = null;
            }
        }

        if (keyword != null && keyword.trim().isEmpty()) {
            keyword = null;
        }

        List<User> users = userRepository.filterUsers(roleEnum, keyword);

        return users.stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

}