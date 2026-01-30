
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
    @NotNull(message = "VEHICLE_TYPE_NOT_NULL")
    String vehicleType;

    @NotNull(message = "VEHICLE_NUMBER_NOT_NULL")
    @Size(min = 6, message = "LICENSE_PLATE_INVALID")
    String licensePlate;

    @NotNull(message = "VEHICLE_BRAND_NOT_NULL")
    String vehicleBrand;

    String vehicleColor;

    String imageUrl;
}
