package com.mycompany.rideapp.dto.request;

import jakarta.validation.constraints.NotNull;
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
public class ApplyCouponToRideRequest {
    @NotNull(message = "USER_ID_NOT_NULL")
    String userId;

    @NotNull(message = "COUPON_CODE_NOT_NULL")
    String couponCode;

    @NotNull(message = "ORIGINAL_FARE_NOT_NULL")
    Long originalFare;
}
