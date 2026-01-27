
package com.mycompany.rideapp.dto.response;

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
public class RateResponse {
    String id;
    String userId;
    String userName;
    String ratedUserId;
    String ratedUserName;
    Long star;
    String comment;
}
