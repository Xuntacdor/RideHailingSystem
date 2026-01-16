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
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.request.RateRequest;
import com.example.demo.dto.response.ApiResponse;
import com.example.demo.dto.response.RateResponse;
import com.example.demo.service.RateService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/rate")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RateController {
    RateService rateService;

    @PostMapping
    public ApiResponse<RateResponse> createRating(@RequestBody @Validated RateRequest request) {
        log.info("Creating rating: User {} rating User {}", request.getUserId(), request.getRatedUserId());
        return ApiResponse.<RateResponse>builder()
                .code(200)
                .results(rateService.createRating(request))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<RateResponse> getRatingById(@PathVariable String id) {
        log.info("Getting rating by ID: {}", id);
        return ApiResponse.<RateResponse>builder()
                .code(200)
                .results(rateService.getRatingById(id))
                .build();
    }

    @GetMapping("/given/{userId}")
    public ApiResponse<List<RateResponse>> getRatingsGivenByUser(@PathVariable String userId) {
        log.info("Getting ratings given by user: {}", userId);
        return ApiResponse.<List<RateResponse>>builder()
                .code(200)
                .results(rateService.getRatingsGivenByUser(userId))
                .build();
    }

    @GetMapping("/received/{userId}")
    public ApiResponse<List<RateResponse>> getRatingsReceivedByUser(@PathVariable String userId) {
        log.info("Getting ratings received by user: {}", userId);
        return ApiResponse.<List<RateResponse>>builder()
                .code(200)
                .results(rateService.getRatingsReceivedByUser(userId))
                .build();
    }

    @GetMapping("/average/{userId}")
    public ApiResponse<Double> getAverageRating(@PathVariable String userId) {
        log.info("Getting average rating for user: {}", userId);
        return ApiResponse.<Double>builder()
                .code(200)
                .results(rateService.getAverageRating(userId))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<RateResponse> updateRating(
            @PathVariable String id,
            @RequestBody @Validated RateRequest request) {
        log.info("Updating rating with ID: {}", id);
        return ApiResponse.<RateResponse>builder()
                .code(200)
                .results(rateService.updateRating(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteRating(@PathVariable String id) {
        log.info("Deleting rating with ID: {}", id);
        rateService.deleteRating(id);
        return ApiResponse.<String>builder()
                .code(200)
                .results("Rating deleted successfully")
                .build();
    }
}
