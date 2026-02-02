package com.mycompany.rideapp.dto.response;

import java.time.LocalDateTime;

import com.mycompany.rideapp.enums.AchievementType;
import com.mycompany.rideapp.enums.CouponType;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCouponResponse {
    String id;
    String userId;
    String couponId;
    String code;
    String content;
    Double discountPercentage;
    Double discountAmount;
    LocalDateTime assignedAt;
    Boolean isUsed;
    LocalDateTime usedAt;
    LocalDateTime expirationDate;
    Boolean isExpired;
    CouponType couponType;
    AchievementType achievementType;
}
