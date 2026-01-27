
package com.mycompany.rideapp.mapper;

import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import com.mycompany.rideapp.dto.request.SupportTicketRequest;
import com.mycompany.rideapp.dto.response.SupportTicketResponse;
import com.mycompany.rideapp.entity.SupportTicket;
import com.mycompany.rideapp.entity.User;
import com.mycompany.rideapp.enums.TicketStatus;

@Component
public class SupportTicketMapper {

    public static SupportTicket toEntity(SupportTicketRequest request, User user, User assignedAgent) {
        if (request == null)
            return null;
        return SupportTicket.builder()
                .user(user)
                .assignedAgent(assignedAgent)
                .title(request.getTitle())
                .description(request.getDescription())
                .status(TicketStatus.OPEN)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    public static SupportTicketResponse toResponse(SupportTicket ticket) {
        if (ticket == null)
            return null;
        return SupportTicketResponse.builder()
                .id(ticket.getId())
                .userId(ticket.getUser() != null ? ticket.getUser().getId() : null)
                .userName(ticket.getUser() != null ? ticket.getUser().getName() : null)
                .assignedAgentId(ticket.getAssignedAgent() != null ? ticket.getAssignedAgent().getId() : null)
                .assignedAgentName(ticket.getAssignedAgent() != null ? ticket.getAssignedAgent().getName() : null)
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .build();
    }

    public static void updateEntity(SupportTicket ticket, SupportTicketRequest request) {
        if (ticket == null || request == null)
            return;
        if (request.getTitle() != null) {
            ticket.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            ticket.setDescription(request.getDescription());
        }
        ticket.setUpdatedAt(LocalDateTime.now());
    }
}
