package com.mycompany.rideapp.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class ReviewRequest {
    @NotNull(message = "RIDE_ID_NOT_NULL")
    String rideId;

    @NotNull(message = "REVIEWER_ID_NOT_NULL")
    String reviewerId;

    @NotNull(message = "REVIEWEE_ID_NOT_NULL")
    String revieweeId;

    @NotNull(message = "RATING_NOT_NULL")
    @Min(value = 1, message = "RATING_MIN")
    @Max(value = 5, message = "RATING_MAX")
    Long rating;

    @Size(max = 500, message = "COMMENT_MAX_LENGTH")
    String comment;
}
