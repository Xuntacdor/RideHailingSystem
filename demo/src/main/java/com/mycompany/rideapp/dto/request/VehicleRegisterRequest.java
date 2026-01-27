
package com.mycompany.rideapp.dto.request;

import com.mycompany.rideapp.enums.VehicleStatus;

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
public class VehicleRegisterRequest {
    @NotNull(message = "DRIVER_ID_NOT_NULL")
    String driverId;

    @NotNull(message = "VEHICLE_TYPE_NOT_NULL")
    String vehicleType;

    @NotNull(message = "VEHICLE_NUMBER_NOT_NULL")
    @Size(min = 6, message = "VEHICLE_NUMBER_INVALID")
    String vehicleNumber;

    @NotNull(message = "VEHICLE_BRAND_NOT_NULL")
    String vehicleBrand;

    String vehicleColor;

    @NotNull(message = "LICENSE_NUMBER_NOT_NULL")
    String licenseNumber;

    VehicleStatus status;

    String imageUrl;
}
