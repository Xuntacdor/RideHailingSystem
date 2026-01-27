package com.mycompany.rideapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mycompany.rideapp.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, String> {
    
    @Query("SELECT r FROM Review r WHERE r.ride.id = :rideId")
    List<Review> findByRideId(@Param("rideId") String rideId);

    @Query("SELECT r FROM Review r WHERE r.reviewer.id = :reviewerId")
    List<Review> findByReviewerId(@Param("reviewerId") String reviewerId);

    @Query("SELECT r FROM Review r WHERE r.reviewee.id = :revieweeId")
    List<Review> findByRevieweeId(@Param("revieweeId") String revieweeId);

    @Query("SELECT r FROM Review r WHERE r.ride.id = :rideId AND r.reviewer.id = :reviewerId")
    Optional<Review> findByRideIdAndReviewerId(@Param("rideId") String rideId, @Param("reviewerId") String reviewerId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :revieweeId")
    Double calculateAverageRatingByRevieweeId(@Param("revieweeId") String revieweeId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.reviewee.id = :revieweeId")
    Long countByRevieweeId(@Param("revieweeId") String revieweeId);
}
