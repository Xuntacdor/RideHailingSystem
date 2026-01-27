
package com.mycompany.rideapp.dto.response;

import java.time.LocalDateTime;

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
public class CouponResponse {
    String id;
    String code;
    String content;
    Double discountPercentage;
    Double discountAmount;
    Long maxUsageLimit;
    Long usagePerUser;
    Long currentUsageCount;
    Long remainingUsage;
    LocalDateTime expirationDate;
    Boolean isActive;
    Boolean isExpired;
}
