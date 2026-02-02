package com.mycompany.rideapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mycompany.rideapp.entity.UserCoupon;

public interface UserCouponRepository extends JpaRepository<UserCoupon, String> {
    // Find all available (unused) coupons for a user
    List<UserCoupon> findByUserIdAndIsUsedFalse(String userId);

    // Find specific user-coupon assignment
    Optional<UserCoupon> findByUserIdAndCouponId(String userId, String couponId);

    // Check if user already has this coupon
    boolean existsByUserIdAndCouponId(String userId, String couponId);

    // Count how many times a user has used a specific coupon
    @Query("SELECT COUNT(uc) FROM UserCoupon uc WHERE uc.user.id = :userId AND uc.coupon.id = :couponId AND uc.isUsed = true")
    Long countUsedByUserIdAndCouponId(@Param("userId") String userId, @Param("couponId") String couponId);

    // Find all coupons (used and unused) for a user
    List<UserCoupon> findByUserId(String userId);
}
