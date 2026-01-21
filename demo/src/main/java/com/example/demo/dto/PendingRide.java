package com.example.demo.dto;

import java.util.List;

import com.example.demo.dto.request.RideRequest;

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
public class PendingRide {
    String rideRequestId;
    RideRequest request;
    List<String> driverIds;
    int currentDriverIndex;
    Long timestamp;
}
