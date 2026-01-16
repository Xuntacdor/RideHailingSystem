package com.example.demo.dto.response;

import com.example.demo.enums.Status;
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
public class RideResponse {
    String id;

    UserResponse driver;
    UserResponse customer;

    Long startTime;
    Long endTime;
    String startLocation;
    String endLocation;
    Long distance;
    Long fare;
    Status status;
    VehicleType vehicleType;

    // List<ReviewResponse> reviews;
    // List<PaymentResponse> payments;
}