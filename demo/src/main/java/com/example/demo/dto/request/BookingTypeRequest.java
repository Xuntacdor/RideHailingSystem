package com.example.demo.dto.request;

import com.example.demo.enums.VehicleType;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingTypeRequest {

    @NotBlank(message = "Name is required")
    String name;

    @NotBlank(message = "Code is required")
    String code;

    @NotNull(message = "Vehicle type is required")
    VehicleType vehicleType;

    @NotNull(message = "Base fare is required")
    @Min(value = 0, message = "Base fare must be non-negative")
    Long baseFare;

    @NotNull(message = "Price per km is required")
    @Min(value = 0, message = "Price per km must be non-negative")
    Long pricePerKm;

    @NotNull(message = "Price per minute is required")
    @Min(value = 0, message = "Price per minute must be non-negative")
    Long pricePerMinute;

    String description;

    @Builder.Default
    Boolean active = true;

    String iconUrl;
}
