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
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.rideapp.dto.request.ReviewRequest;
import com.mycompany.rideapp.dto.response.ApiResponse;
import com.mycompany.rideapp.dto.response.ReviewResponse;
import com.mycompany.rideapp.service.ReviewService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/review")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ReviewController {
    
    ReviewService reviewService;

    @PostMapping
    public ApiResponse<ReviewResponse> createReview(@RequestBody @Validated ReviewRequest request) {
        return ApiResponse.<ReviewResponse>builder()
                .code(200)
                .results(reviewService.createReview(request))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ReviewResponse> getReviewById(@PathVariable String id) {
        return ApiResponse.<ReviewResponse>builder()
                .code(200)
                .results(reviewService.getReviewById(id))
                .build();
    }

    @GetMapping("/ride/{rideId}")
    public ApiResponse<List<ReviewResponse>> getReviewsByRideId(@PathVariable String rideId) {
        return ApiResponse.<List<ReviewResponse>>builder()
                .code(200)
                .results(reviewService.getReviewsByRideId(rideId))
                .build();
    }

    @GetMapping("/reviewer/{reviewerId}")
    public ApiResponse<List<ReviewResponse>> getReviewsByReviewerId(@PathVariable String reviewerId) {
        return ApiResponse.<List<ReviewResponse>>builder()
                .code(200)
                .results(reviewService.getReviewsByReviewerId(reviewerId))
                .build();
    }

    @GetMapping("/reviewee/{revieweeId}")
    public ApiResponse<List<ReviewResponse>> getReviewsByRevieweeId(@PathVariable String revieweeId) {
        return ApiResponse.<List<ReviewResponse>>builder()
                .code(200)
                .results(reviewService.getReviewsByRevieweeId(revieweeId))
                .build();
    }

    @GetMapping("/average/{revieweeId}")
    public ApiResponse<Double> getAverageRating(@PathVariable String revieweeId) {
        return ApiResponse.<Double>builder()
                .code(200)
                .results(reviewService.getAverageRatingByRevieweeId(revieweeId))
                .build();
    }

    @GetMapping("/count/{revieweeId}")
    public ApiResponse<Long> getReviewCount(@PathVariable String revieweeId) {
        return ApiResponse.<Long>builder()
                .code(200)
                .results(reviewService.getReviewCountByRevieweeId(revieweeId))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<ReviewResponse> updateReview(
            @PathVariable String id,
            @RequestBody @Validated ReviewRequest request) {
        return ApiResponse.<ReviewResponse>builder()
                .code(200)
                .results(reviewService.updateReview(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteReview(@PathVariable String id) {
        reviewService.deleteReview(id);
        return ApiResponse.<String>builder()
                .code(200)
                .results("Review deleted successfully")
                .build();
    }
}
