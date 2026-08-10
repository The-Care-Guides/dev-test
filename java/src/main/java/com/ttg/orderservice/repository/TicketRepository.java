package com.ttg.orderservice.repository;

import com.ttg.orderservice.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByPerformanceId(Long performanceId);
}
