
package com.mycompany.rideapp.dto.response;

import com.mycompany.rideapp.enums.VehicleStatus;

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
public class VehicleRegisterResponse {
    String id;
    String driverId;
    String vehicleType;
    String licensePlate;
    String vehicleBrand;
    String vehicleColor;
    String licenseNumber;
    VehicleStatus status;
    String imageUrl;
}
