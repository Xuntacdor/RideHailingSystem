package com.example.demo.dto;

import com.example.demo.enums.VehicleType;

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
public class RideNotification {
    String rideRequestId;
    String customerId;
    String customerName;
    String startLocation;
    String endLocation;
    Double customerLatitude;
    Double customerLongitude;
    Long distance;
    Long fare;
    VehicleType vehicleType;
    Long timestamp;
}
