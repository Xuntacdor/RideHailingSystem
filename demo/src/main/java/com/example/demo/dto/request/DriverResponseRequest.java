package com.example.demo.dto.request;

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
public class DriverResponseRequest {
    @NotNull(message = "RIDE_REQUEST_ID_NOT_NULL")
    String rideRequestId;

    @NotNull(message = "DRIVER_ID_NOT_NULL")
    String driverId;

    @NotNull(message = "ACCEPTED_NOT_NULL")
    Boolean accepted;
}
