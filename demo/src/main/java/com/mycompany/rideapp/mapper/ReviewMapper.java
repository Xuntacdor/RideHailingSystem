package com.mycompany.rideapp.mapper;

import org.springframework.stereotype.Component;

import com.mycompany.rideapp.dto.request.ReviewRequest;
import com.mycompany.rideapp.dto.response.ReviewResponse;
import com.mycompany.rideapp.entity.Review;
import com.mycompany.rideapp.entity.Ride;
import com.mycompany.rideapp.entity.User;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ReviewMapper {
    
    private final UserMapper userMapper;

    public Review toEntity(ReviewRequest request, Ride ride, User reviewer, User reviewee) {
        if (request == null) {
            return null;
        }
        
        return Review.builder()
                .ride(ride)
                .reviewer(reviewer)
                .reviewee(reviewee)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
    }

    public ReviewResponse toResponse(Review review) {
        if (review == null) {
            return null;
        }
        
        return ReviewResponse.builder()
                .id(review.getId())
                .rideId(review.getRide() != null ? review.getRide().getId() : null)
                .reviewer(review.getReviewer() != null ? userMapper.toResponse(review.getReviewer()) : null)
                .reviewee(review.getReviewee() != null ? userMapper.toResponse(review.getReviewee()) : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .build();
    }
}
