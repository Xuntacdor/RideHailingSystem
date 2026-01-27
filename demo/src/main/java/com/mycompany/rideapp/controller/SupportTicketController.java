package com.mycompany.rideapp.controller;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.rideapp.dto.request.SupportTicketRequest;
import com.mycompany.rideapp.dto.response.ApiResponse;
import com.mycompany.rideapp.dto.response.SupportTicketResponse;
import com.mycompany.rideapp.enums.TicketStatus;
import com.mycompany.rideapp.service.SupportTicketService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/ticket")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SupportTicketController {
    SupportTicketService supportTicketService;

    @PostMapping
    public ApiResponse<SupportTicketResponse> createTicket(
            @RequestBody @Validated SupportTicketRequest request) {
        return ApiResponse.<SupportTicketResponse>builder()
                .code(200)
                .results(supportTicketService.createTicket(request))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<SupportTicketResponse> getTicketById(@PathVariable String id) {
        return ApiResponse.<SupportTicketResponse>builder()
                .code(200)
                .results(supportTicketService.getTicketById(id))
                .build();
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<SupportTicketResponse>> getUserTickets(@PathVariable String userId) {
        return ApiResponse.<List<SupportTicketResponse>>builder()
                .code(200)
                .results(supportTicketService.getUserTickets(userId))
                .build();
    }

    @GetMapping("/agent/{agentId}")
    public ApiResponse<List<SupportTicketResponse>> getAgentTickets(@PathVariable String agentId) {
        return ApiResponse.<List<SupportTicketResponse>>builder()
                .code(200)
                .results(supportTicketService.getAgentTickets(agentId))
                .build();
    }

    @PutMapping("/{id}/status")
    public ApiResponse<SupportTicketResponse> updateTicketStatus(
            @PathVariable String id,
            @RequestParam TicketStatus status) {
        return ApiResponse.<SupportTicketResponse>builder()
                .code(200)
                .results(supportTicketService.updateTicketStatus(id, status))
                .build();
    }

    @PutMapping("/{id}/reassign")
    public ApiResponse<SupportTicketResponse> reassignTicket(
            @PathVariable String id,
            @RequestParam String agentId) {
        return ApiResponse.<SupportTicketResponse>builder()
                .code(200)
                .results(supportTicketService.reassignTicket(id, agentId))
                .build();
    }

    @PutMapping("/{id}/resolve")
    public ApiResponse<SupportTicketResponse> resolveTicket(@PathVariable String id) {
        return ApiResponse.<SupportTicketResponse>builder()
                .code(200)
                .results(supportTicketService.resolveTicket(id))
                .build();
    }

    @GetMapping("/status/{status}")
    public ApiResponse<List<SupportTicketResponse>> getTicketsByStatus(@PathVariable TicketStatus status) {
        return ApiResponse.<List<SupportTicketResponse>>builder()
                .code(200)
                .results(supportTicketService.getTicketsByStatus(status))
                .build();
    }
}
