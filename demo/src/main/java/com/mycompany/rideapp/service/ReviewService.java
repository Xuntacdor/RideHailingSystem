package com.mycompany.rideapp.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.mycompany.rideapp.dto.request.ReviewRequest;
import com.mycompany.rideapp.dto.response.ReviewResponse;
import com.mycompany.rideapp.entity.Driver;
import com.mycompany.rideapp.entity.Review;
import com.mycompany.rideapp.entity.Ride;
import com.mycompany.rideapp.entity.User;
import com.mycompany.rideapp.exception.AppException;
import com.mycompany.rideapp.exception.ErrorCode;
import com.mycompany.rideapp.mapper.ReviewMapper;
import com.mycompany.rideapp.repository.ReviewRepository;
import com.mycompany.rideapp.repository.RideRepository;
import com.mycompany.rideapp.repository.UserRepository;
import com.mycompany.rideapp.repository.DriverRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ReviewService {

    ReviewRepository reviewRepository;
    RideRepository rideRepository;
    UserRepository userRepository;
    DriverRepository driverRepository;
    ReviewMapper reviewMapper;

    public ReviewResponse createReview(ReviewRequest request) {
        log.info("Creating review for ride: {}", request.getRideId());

        // Check if review already exists for this ride and reviewer
        reviewRepository.findByRideIdAndReviewerId(request.getRideId(), request.getReviewerId())
                .ifPresent(review -> {
                    throw new AppException(ErrorCode.REVIEW_ALREADY_EXISTS);
                });

        // Validate ride exists
        Ride ride = rideRepository.findById(request.getRideId())
                .orElseThrow(() -> new AppException(ErrorCode.RIDE_NOT_FOUND));

        // Validate reviewer exists
        User reviewer = userRepository.findById(request.getReviewerId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Validate reviewee exists
        Driver reviewee = driverRepository.findById(request.getRevieweeId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Review review = reviewMapper.toEntity(request, ride, reviewer, reviewee);
        review = reviewRepository.save(review);

        // Update driver rating if reviewee is a driver
        updateDriverRating(request.getRevieweeId());

        log.info("Review created successfully with id: {}", review.getId());
        return reviewMapper.toResponse(review);
    }

    public ReviewResponse getReviewById(String id) {
        log.info("Fetching review with id: {}", id);
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
        return reviewMapper.toResponse(review);
    }

    public List<ReviewResponse> getReviewsByRideId(String rideId) {
        log.info("Fetching reviews for ride: {}", rideId);
        return reviewRepository.findByRideId(rideId)
                .stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getReviewsByReviewerId(String reviewerId) {
        log.info("Fetching reviews given by reviewer: {}", reviewerId);
        return reviewRepository.findByReviewerId(reviewerId)
                .stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getReviewsByRevieweeId(String revieweeId) {
        log.info("Fetching reviews received by reviewee: {}", revieweeId);
        return reviewRepository.findByRevieweeId(revieweeId)
                .stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    public Double getAverageRatingByRevieweeId(String revieweeId) {
        log.info("Calculating average rating for reviewee: {}", revieweeId);
        Double average = reviewRepository.calculateAverageRatingByRevieweeId(revieweeId);
        return average != null ? average : 0.0;
    }

    public ReviewResponse updateReview(String id, ReviewRequest request) {
        log.info("Updating review with id: {}", id);

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        // Update only rating and comment
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        review = reviewRepository.save(review);

        // Update driver rating if reviewee is a driver
        if (review.getReviewee() != null) {
            updateDriverRating(review.getReviewee().getId());
        }

        log.info("Review updated successfully");
        return reviewMapper.toResponse(review);
    }

    public void deleteReview(String id) {
        log.info("Deleting review with id: {}", id);

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        String revieweeId = review.getReviewee() != null ? review.getReviewee().getId() : null;

        reviewRepository.deleteById(id);

        // Update driver rating after deletion
        if (revieweeId != null) {
            updateDriverRating(revieweeId);
        }

        log.info("Review deleted successfully");
    }

    private void updateDriverRating(String userId) {
        driverRepository.findByUserId(userId).ifPresent(driver -> {
            Double averageRating = reviewRepository.calculateAverageRatingByRevieweeId(userId);
            driver.setRating(averageRating != null ? averageRating : 0.0);
            driverRepository.save(driver);
            log.info("Updated driver rating to: {}", driver.getRating());
        });
    }

    public Long getReviewCountByRevieweeId(String revieweeId) {
        log.info("Counting reviews for reviewee: {}", revieweeId);
        return reviewRepository.countByRevieweeId(revieweeId);
    }
}
