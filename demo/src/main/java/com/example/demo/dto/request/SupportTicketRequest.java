
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
public class SupportTicketRequest {
    @NotNull(message = "USER_ID_NOT_NULL")
    String userId;

    @NotNull(message = "TITLE_NOT_NULL")
    @Size(min = 5, max = 200, message = "TITLE_INVALID")
    String title;

    @NotNull(message = "DESCRIPTION_NOT_NULL")
    @Size(min = 10, message = "DESCRIPTION_INVALID")
    String description;
}
