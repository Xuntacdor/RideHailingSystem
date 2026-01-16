
package com.example.demo.dto.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class CouponRequest {
    @NotNull(message = "CODE_NOT_NULL")
    @Size(min = 3, max = 50, message = "CODE_INVALID")
    String code;

    String content;

    @Min(value = 0, message = "DISCOUNT_PERCENTAGE_MIN")
    @Max(value = 100, message = "DISCOUNT_PERCENTAGE_MAX")
    Double discountPercentage;

    @Min(value = 0, message = "DISCOUNT_AMOUNT_MIN")
    Double discountAmount;

    @Min(value = 1, message = "MAX_USAGE_LIMIT_MIN")
    Long maxUsageLimit;

    @Min(value = 1, message = "USAGE_PER_USER_MIN")
    Long usagePerUser;

    LocalDateTime expirationDate;
}
