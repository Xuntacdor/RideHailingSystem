package com.example.demo.dto.request;

import com.example.demo.enums.Status;
import com.example.demo.enums.VehicleType;

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
public class RideRequest {
    String driverId;

    @NotNull(message = "CUSTOMER_ID_NOT_NULL")
    String customerId;

    Long startTime;

    Long endTime;

    @NotNull(message = "START_LATITUDE_NOT_NULL")
    Double startLatitude;

    @NotNull(message = "START_LONGITUDE_NOT_NULL")
    Double startLongitude;

    @NotNull(message = "END_LATITUDE_NOT_NULL")
    Double endLatitude;

    @NotNull(message = "END_LONGITUDE_NOT_NULL")
    Double endLongitude;

    @NotNull(message = "CUSTOMER_LATITUDE_NOT_NULL")
    Double customerLatitude;

    @NotNull(message = "CUSTOMER_LONGITUDE_NOT_NULL")
    Double customerLongitude;

    @NotNull(message = "DISTANCE_NOT_NULL")
    Long distance;

    @NotNull(message = "FARE_NOT_NULL")
    Long fare;

    Status status;

    @NotNull(message = "VEHICLE_TYPE_NOT_NULL")
    VehicleType vehicleType;
}