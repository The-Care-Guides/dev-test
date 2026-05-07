package com.ttg.orderservice.repository;

import com.ttg.orderservice.entity.Performance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PerformanceRepository extends JpaRepository<Performance, Long> {

    List<Performance> findByStatus(Performance.PerformanceStatus status);

    List<Performance> findByEventDateAfter(LocalDateTime date);

    List<Performance> findByVenue(String venue);
}
