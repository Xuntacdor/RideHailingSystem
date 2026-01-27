
package com.mycompany.rideapp.dto.request;

import com.mycompany.rideapp.enums.Role;

import jakarta.validation.constraints.Email;
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
public class UserRequest {
    @NotNull(message = "NAME_NOT_NULL")
    String name;

    @Size(min = 6, message = "USERNAME_INVALID")
    @NotNull(message = "USERNAME_NOT_NULL")
    String userName;

    @NotNull(message = "PHONENUMBER_NOT_NULL")
    String phoneNumber;

    @Size(min = 6, message = "PASSWORD_INVALID")
    @NotNull(message = "PASSWORD_INVALID")
    String password;

    @NotNull(message = "ROLE_NOT_NULL")
    Role role;

    String cccd;

    @Email(message = "EMAIL_NOT_VALID")
    String email;

    String ImageUrl;
    String accountType;
}