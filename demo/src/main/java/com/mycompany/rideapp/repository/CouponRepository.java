
package com.mycompany.rideapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mycompany.rideapp.entity.Coupon;
import com.mycompany.rideapp.enums.AchievementType;
import com.mycompany.rideapp.enums.CouponType;

public interface CouponRepository extends JpaRepository<Coupon, String> {
    Optional<Coupon> findByCode(String code);

    List<Coupon> findByIsActiveTrue();

    List<Coupon> findByCouponType(CouponType couponType);

    Optional<Coupon> findByAchievementTypeAndIsActiveTrue(AchievementType achievementType);
}
