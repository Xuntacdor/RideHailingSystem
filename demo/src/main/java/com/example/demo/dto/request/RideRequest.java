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
    @NotNull(message = "DRIVER_ID_NOT_NULL")
    String driverId;

    @NotNull(message = "CUSTOMER_ID_NOT_NULL")
    String customerId;

    @NotNull(message = "START_TIME_NOT_NULL")
    Long startTime;

    @NotNull(message = "END_TIME_NOT_NULL")
    Long endTime;

    @NotNull(message = "START_LOCATION_NOT_NULL")
    String startLocation;

    @NotNull(message = "END_LOCATION_NOT_NULL")
    String endLocation;

    @NotNull(message = "DISTANCE_NOT_NULL")
    Long distance;

    @NotNull(message = "FARE_NOT_NULL")
    Long fare;

    @NotNull(message = "STATUS_NOT_NULL")
    Status status;

    @NotNull(message = "VEHICLE_TYPE_NOT_NULL")
    VehicleType vehicleType;
}