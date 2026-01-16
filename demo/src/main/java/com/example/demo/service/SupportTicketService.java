
package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.dto.request.SupportTicketRequest;
import com.example.demo.dto.response.SupportTicketResponse;
import com.example.demo.entity.SupportTicket;
import com.example.demo.entity.User;
import com.example.demo.enums.AccountStatus;
import com.example.demo.enums.Role;
import com.example.demo.enums.TicketStatus;
import com.example.demo.exception.AppException;
import com.example.demo.exception.ErrorCode;
import com.example.demo.mapper.SupportTicketMapper;
import com.example.demo.repository.SupportTicketRepository;
import com.example.demo.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SupportTicketService {
    SupportTicketRepository supportTicketRepository;
    UserRepository userRepository;
    Random random = new Random();

    public SupportTicketResponse createTicket(SupportTicketRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        User assignedAgent = assignSupportAgent();

        if (assignedAgent == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        SupportTicket ticket = SupportTicketMapper.toEntity(request, user, assignedAgent);
        supportTicketRepository.save(ticket);

        log.info("Support ticket created with ID: {} and assigned to agent: {}",
                ticket.getId(), assignedAgent.getName());
        return SupportTicketMapper.toResponse(ticket);
    }

    private User assignSupportAgent() {
        List<User> allSupporters = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.SUPPORTER)
                .collect(Collectors.toList());

        if (allSupporters.isEmpty()) {
            log.warn("No support agents found in the system");
            return null;
        }

        List<User> onlineSupporters = allSupporters.stream()
                .filter(u -> u.getStatus() == AccountStatus.ACTIVE)
                .collect(Collectors.toList());

        if (!onlineSupporters.isEmpty()) {
            User selectedAgent = onlineSupporters.get(random.nextInt(onlineSupporters.size()));
            log.info("Assigned to ONLINE support agent: {}", selectedAgent.getName());
            return selectedAgent;
        } else {
            User selectedAgent = allSupporters.get(random.nextInt(allSupporters.size()));
            log.info("No online agents available. Assigned to OFFLINE support agent: {}", selectedAgent.getName());
            return selectedAgent;
        }
    }

    public SupportTicketResponse getTicketById(String id) {
        SupportTicket ticket = supportTicketRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return SupportTicketMapper.toResponse(ticket);
    }

    public List<SupportTicketResponse> getUserTickets(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        return supportTicketRepository.findByUserId(userId).stream()
                .map(SupportTicketMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<SupportTicketResponse> getAgentTickets(String agentId) {
        if (!userRepository.existsById(agentId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        return supportTicketRepository.findByAssignedAgentId(agentId).stream()
                .map(SupportTicketMapper::toResponse)
                .collect(Collectors.toList());
    }

    public SupportTicketResponse updateTicketStatus(String id, TicketStatus status) {
        SupportTicket ticket = supportTicketRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        ticket.setStatus(status);
        ticket.setUpdatedAt(LocalDateTime.now());

        if (status == TicketStatus.RESOLVED || status == TicketStatus.CLOSED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        supportTicketRepository.save(ticket);
        log.info("Ticket {} status updated to {}", id, status);
        return SupportTicketMapper.toResponse(ticket);
    }

    public SupportTicketResponse reassignTicket(String ticketId, String newAgentId) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        User newAgent = userRepository.findById(newAgentId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (newAgent.getRole() != Role.SUPPORTER) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        ticket.setAssignedAgent(newAgent);
        ticket.setUpdatedAt(LocalDateTime.now());
        supportTicketRepository.save(ticket);

        log.info("Ticket {} reassigned to agent: {}", ticketId, newAgent.getName());
        return SupportTicketMapper.toResponse(ticket);
    }

    public SupportTicketResponse resolveTicket(String id) {
        return updateTicketStatus(id, TicketStatus.RESOLVED);
    }

    public List<SupportTicketResponse> getTicketsByStatus(TicketStatus status) {
        return supportTicketRepository.findByStatus(status).stream()
                .map(SupportTicketMapper::toResponse)
                .collect(Collectors.toList());
    }
}
