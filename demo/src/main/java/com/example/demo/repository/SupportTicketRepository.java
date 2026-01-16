
package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.entity.SupportTicket;
import com.example.demo.enums.TicketStatus;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, String> {
    @Query("SELECT t FROM SupportTicket t WHERE t.user.id = :userId")
    List<SupportTicket> findByUserId(@Param("userId") String userId);

    @Query("SELECT t FROM SupportTicket t WHERE t.assignedAgent.id = :agentId")
    List<SupportTicket> findByAssignedAgentId(@Param("agentId") String agentId);

    List<SupportTicket> findByStatus(TicketStatus status);
}
