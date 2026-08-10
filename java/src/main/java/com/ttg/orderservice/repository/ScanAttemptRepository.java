package com.ttg.orderservice.repository;

import com.ttg.orderservice.entity.ScanAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScanAttemptRepository extends JpaRepository<ScanAttempt, Long> {

    List<ScanAttempt> findByTicketIdOrderByScannedAtAsc(Long ticketId);

    long countByTicketId(Long ticketId);
}
