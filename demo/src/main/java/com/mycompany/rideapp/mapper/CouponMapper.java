
package com.mycompany.rideapp.mapper;

import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import com.mycompany.rideapp.dto.request.CouponRequest;
import com.mycompany.rideapp.dto.response.CouponResponse;
import com.mycompany.rideapp.entity.Coupon;

@Component
public class CouponMapper {

    public static Coupon toEntity(CouponRequest request) {
        if (request == null)
            return null;
        return Coupon.builder()
                .code(request.getCode())
                .content(request.getContent())
                .discountPercentage(request.getDiscountPercentage())
                .discountAmount(request.getDiscountAmount())
                .maxUsageLimit(request.getMaxUsageLimit())
                .usagePerUser(request.getUsagePerUser())
                .currentUsageCount(0L)
                .expirationDate(request.getExpirationDate())
                .isActive(true)
                .build();
    }

    public static CouponResponse toResponse(Coupon coupon) {
        if (coupon == null)
            return null;

        Long remainingUsage = null;
        if (coupon.getMaxUsageLimit() != null && coupon.getCurrentUsageCount() != null) {
            remainingUsage = coupon.getMaxUsageLimit() - coupon.getCurrentUsageCount();
        }

        boolean isExpired = coupon.getExpirationDate() != null &&
                LocalDateTime.now().isAfter(coupon.getExpirationDate());

        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .content(coupon.getContent())
                .discountPercentage(coupon.getDiscountPercentage())
                .discountAmount(coupon.getDiscountAmount())
                .maxUsageLimit(coupon.getMaxUsageLimit())
                .usagePerUser(coupon.getUsagePerUser())
                .currentUsageCount(coupon.getCurrentUsageCount())
                .remainingUsage(remainingUsage)
                .expirationDate(coupon.getExpirationDate())
                .isActive(coupon.getIsActive())
                .isExpired(isExpired)
                .build();
    }

    public static void updateEntity(Coupon coupon, CouponRequest request) {
        if (coupon == null || request == null)
            return;
        if (request.getCode() != null) {
            coupon.setCode(request.getCode());
        }
        if (request.getContent() != null) {
            coupon.setContent(request.getContent());
        }
        if (request.getDiscountPercentage() != null) {
            coupon.setDiscountPercentage(request.getDiscountPercentage());
        }
        if (request.getDiscountAmount() != null) {
            coupon.setDiscountAmount(request.getDiscountAmount());
        }
        if (request.getMaxUsageLimit() != null) {
            coupon.setMaxUsageLimit(request.getMaxUsageLimit());
        }
        if (request.getUsagePerUser() != null) {
            coupon.setUsagePerUser(request.getUsagePerUser());
        }
        if (request.getExpirationDate() != null) {
            coupon.setExpirationDate(request.getExpirationDate());
        }
    }
}
