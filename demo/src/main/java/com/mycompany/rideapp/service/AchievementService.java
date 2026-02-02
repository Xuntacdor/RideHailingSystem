package com.mycompany.rideapp.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.mycompany.rideapp.entity.Coupon;
import com.mycompany.rideapp.entity.User;
import com.mycompany.rideapp.entity.UserCoupon;
import com.mycompany.rideapp.enums.AchievementType;
import com.mycompany.rideapp.enums.CouponType;
import com.mycompany.rideapp.enums.Status;
import com.mycompany.rideapp.exception.AppException;
import com.mycompany.rideapp.exception.ErrorCode;
import com.mycompany.rideapp.repository.CouponRepository;
import com.mycompany.rideapp.repository.RideRepository;
import com.mycompany.rideapp.repository.UserCouponRepository;
import com.mycompany.rideapp.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AchievementService {
    CouponRepository couponRepository;
    UserCouponRepository userCouponRepository;
    UserRepository userRepository;
    RideRepository rideRepository;

    /**
     * Award default coupons to a new user upon registration
     */
    public void awardDefaultCoupons(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        // Find all DEFAULT type coupons
        List<Coupon> defaultCoupons = couponRepository.findByCouponType(CouponType.DEFAULT);

        for (Coupon coupon : defaultCoupons) {
            if (coupon.getIsActive() && !userCouponRepository.existsByUserIdAndCouponId(userId, coupon.getId())) {
                assignCouponToUser(userId, coupon.getId());
                log.info("Awarded default coupon {} to new user {}", coupon.getCode(), userId);
            }
        }

        // Award NEW_USER achievement coupon
        awardAchievementCoupon(userId, AchievementType.NEW_USER);
    }

    /**
     * Check user's ride count and award achievement-based coupons
     */
    public void checkAndAwardCoupons(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        // Count completed rides for this user
        Long completedRidesCount = rideRepository.countByCustomer_IdAndStatus(userId, Status.FINISHED);

        log.info("User {} has completed {} rides", userId, completedRidesCount);

        // Check achievement milestones
        if (completedRidesCount == 1) {
            awardAchievementCoupon(userId, AchievementType.FIRST_RIDE);
        } else if (completedRidesCount == 5) {
            awardAchievementCoupon(userId, AchievementType.RIDES_5);
        } else if (completedRidesCount == 10) {
            awardAchievementCoupon(userId, AchievementType.RIDES_10);
        } else if (completedRidesCount == 25) {
            awardAchievementCoupon(userId, AchievementType.RIDES_25);
        } else if (completedRidesCount == 50) {
            awardAchievementCoupon(userId, AchievementType.RIDES_50);
        }
    }

    /**
     * Award an achievement-based coupon to a user
     */
    private void awardAchievementCoupon(String userId, AchievementType achievementType) {
        Optional<Coupon> couponOpt = couponRepository.findByAchievementTypeAndIsActiveTrue(achievementType);

        if (couponOpt.isPresent()) {
            Coupon coupon = couponOpt.get();

            // Check if user already has this achievement coupon
            if (!userCouponRepository.existsByUserIdAndCouponId(userId, coupon.getId())) {
                assignCouponToUser(userId, coupon.getId());
                log.info("Awarded achievement coupon {} ({}) to user {}",
                        coupon.getCode(), achievementType, userId);
            }
        } else {
            log.warn("No active coupon found for achievement type: {}", achievementType);
        }
    }

    /**
     * Manually assign a coupon to a user (used by admins)
     */
    public UserCoupon assignCouponToUser(String userId, String couponId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Check if user already has this coupon
        if (userCouponRepository.existsByUserIdAndCouponId(userId, couponId)) {
            log.warn("User {} already has coupon {}", userId, couponId);
            return userCouponRepository.findByUserIdAndCouponId(userId, couponId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        }

        UserCoupon userCoupon = UserCoupon.builder()
                .user(user)
                .coupon(coupon)
                .assignedAt(LocalDateTime.now())
                .isUsed(false)
                .build();

        userCouponRepository.save(userCoupon);

        log.info("Assigned coupon {} to user {}", couponId, userId);
        return userCoupon;
    }
}
