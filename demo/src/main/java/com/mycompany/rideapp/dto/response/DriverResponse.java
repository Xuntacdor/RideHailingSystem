
package com.mycompany.rideapp.dto.response;

import java.util.List;

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
public class DriverResponse {
    String id;
    UserResponse user;
    String licenseNumber;
    String driverStatus;
    String address;
    String avatarUrl;
    Double rating;
    List<String> vehicleIds;
}
