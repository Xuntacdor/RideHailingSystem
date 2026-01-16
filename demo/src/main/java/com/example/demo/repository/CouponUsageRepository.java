
package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.entity.CouponUsage;

public interface CouponUsageRepository extends JpaRepository<CouponUsage, String> {
    @Query("SELECT COUNT(cu) FROM CouponUsage cu WHERE cu.coupon.id = :couponId AND cu.user.id = :userId")
    Long countByCouponIdAndUserId(@Param("couponId") String couponId, @Param("userId") String userId);

    @Query("SELECT cu FROM CouponUsage cu WHERE cu.coupon.id = :couponId")
    List<CouponUsage> findByCouponId(@Param("couponId") String couponId);

    @Query("SELECT cu FROM CouponUsage cu WHERE cu.user.id = :userId")
    List<CouponUsage> findByUserId(@Param("userId") String userId);
}
