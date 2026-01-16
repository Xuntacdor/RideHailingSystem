
package com.example.demo.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class DriverRequest {
    @NotNull(message = "USER_ID_NOT_NULL")
    String userId;

    @NotNull(message = "LICENSE_NUMBER_NOT_NULL")
    @Size(min = 8, message = "LICENSE_NUMBER_INVALID")
    String licenseNumber;

    String driverStatus;

    @NotNull(message = "ADDRESS_NOT_NULL")
    String address;

    String avatarUrl;
}
