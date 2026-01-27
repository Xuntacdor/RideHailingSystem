package com.mycompany.rideapp.dto.response;

import com.mycompany.rideapp.enums.VehicleType;

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
public class BookingTypeResponse {

    String id;
    String name;
    String code;
    VehicleType vehicleType;
    Long baseFare;
    Long pricePerKm;
    Long pricePerMinute;
    String description;
    Boolean active;
    String iconUrl;
}
