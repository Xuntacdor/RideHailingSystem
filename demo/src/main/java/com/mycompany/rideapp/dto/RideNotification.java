package com.mycompany.rideapp.dto;

import com.mycompany.rideapp.enums.VehicleType;

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
    Double startLatitude;
    Double startLongitude;
    Double endLatitude;
    Double endLongitude;
    String startAddress;
    String endAddress;
    Long distance;
    Long fare;
    VehicleType vehicleType;
    Long timestamp;
}
