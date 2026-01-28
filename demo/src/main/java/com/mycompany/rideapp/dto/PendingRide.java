package com.mycompany.rideapp.dto;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;

import com.mycompany.rideapp.dto.request.RideRequest;

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
    @Builder.Default
    AtomicBoolean accepted = new AtomicBoolean(false);
    Long timestamp;
    
    @Builder.Default
    Set<String> rejectedDriverIds = new HashSet<>();
}
