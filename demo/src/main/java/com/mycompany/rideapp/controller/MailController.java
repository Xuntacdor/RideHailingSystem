package com.mycompany.rideapp.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.rideapp.dto.request.EmailRequest;
import com.mycompany.rideapp.dto.response.ApiResponse;
import com.mycompany.rideapp.service.MailService;

import jakarta.mail.MessagingException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class MailController {
    MailService mailService;
    // EmailValidationService validateService;

    @PostMapping("/send")
    public ApiResponse<String> sendMail(@RequestBody EmailRequest request) throws MessagingException {
        mailService.sendMail(request.getEmail(), "test", request.getDescription());
        return ApiResponse.<String>builder().code(200).results("success").build();
    }
}
