package com.ttg.orderservice.controller;

import com.ttg.orderservice.entity.Performance;
import com.ttg.orderservice.repository.PerformanceRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/performances")
public class PerformanceController {

    private final PerformanceRepository performanceRepository;

    public PerformanceController(PerformanceRepository performanceRepository) {
        this.performanceRepository = performanceRepository;
    }

    @GetMapping
    public List<Performance> listPerformances() {
        return performanceRepository.findAll();
    }

    @GetMapping("/{id}")
    public Performance getPerformance(@PathVariable Long id) {
        return performanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Performance not found: " + id));
    }
}
