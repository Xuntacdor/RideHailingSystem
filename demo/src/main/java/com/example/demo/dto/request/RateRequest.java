
package com.example.demo.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class RateRequest {
    @NotNull(message = "USER_ID_NOT_NULL")
    String userId;

    @NotNull(message = "RATED_USER_ID_NOT_NULL")
    String ratedUserId;

    @NotNull(message = "STAR_NOT_NULL")
    @Min(value = 1, message = "STAR_MIN_VALUE")
    @Max(value = 5, message = "STAR_MAX_VALUE")
    Long star;

    String comment;
}
