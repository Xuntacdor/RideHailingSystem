package com.mycompany.rideapp.config;

import java.util.HashSet;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.mycompany.rideapp.entity.User;
import com.mycompany.rideapp.enums.Role;
import com.mycompany.rideapp.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;

@Configuration
@RequiredArgsConstructor 
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppInitConfig {
       final PasswordEncoder passwordEncoder;

    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository){ 
        return args ->{
        if (userRepository.findByUserName("admin").isEmpty()) {
        User user = User.builder()
                .userName("admin")
                .password(passwordEncoder.encode("123456789"))
                .email("admin@gmail.com")
                .role(Role.ADMIN)
                .build();

        userRepository.save(user);
        }  
    };
    }  
}
