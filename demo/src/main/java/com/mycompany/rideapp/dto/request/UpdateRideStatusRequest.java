package com.mycompany.rideapp.dto.request;

import com.mycompany.rideapp.enums.Status;

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
public class UpdateRideStatusRequest {
    @NotNull(message = "STATUS_NOT_NULL")
    Status status;
}