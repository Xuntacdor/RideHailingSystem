
package com.example.demo.dto.response;

import java.time.LocalDateTime;

import com.example.demo.enums.TicketStatus;

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
public class SupportTicketResponse {
    String id;
    String userId;
    String userName;
    String assignedAgentId;
    String assignedAgentName;
    String title;
    String description;
    TicketStatus status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    LocalDateTime resolvedAt;
}
