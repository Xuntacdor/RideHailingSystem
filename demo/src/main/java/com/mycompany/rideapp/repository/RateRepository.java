
package com.mycompany.rideapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mycompany.rideapp.entity.Rate;

public interface RateRepository extends JpaRepository<Rate, String> {
    @Query("SELECT r FROM Rate r WHERE r.user.id = :userId")
    List<Rate> findByUserId(@Param("userId") String userId);

    @Query("SELECT r FROM Rate r WHERE r.ratedUser.id = :ratedUserId")
    List<Rate> findByRatedUserId(@Param("ratedUserId") String ratedUserId);

    @Query("SELECT r FROM Rate r WHERE r.user.id = :userId AND r.ratedUser.id = :ratedUserId")
    Optional<Rate> findByUserIdAndRatedUserId(@Param("userId") String userId, @Param("ratedUserId") String ratedUserId);

    @Query("SELECT AVG(r.star) FROM Rate r WHERE r.ratedUser.id = :ratedUserId")
    Double calculateAverageRatingByRatedUserId(@Param("ratedUserId") String ratedUserId);
}
