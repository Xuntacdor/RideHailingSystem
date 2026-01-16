
package com.example.demo.dto.response;

import com.example.demo.enums.Role;

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
public class UserResponse {
    String id;
    String name;
    String userName;
    String phoneNumber;
    Role role;
    String cccd;
    String email;
    String ImageUrl;
    String accountType;
}