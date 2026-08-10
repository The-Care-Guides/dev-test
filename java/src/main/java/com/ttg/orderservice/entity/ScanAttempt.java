package com.ttg.orderservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * One presentation of a ticket at a door, admitted or turned away.
 *
 * <p>{@code ticket} is nullable so a presentation that resolves to no ticket can still be
 * recorded, and {@code result} is a free-text outcome — the vocabulary is a design decision.
 */
@Entity
@Table(name = "scan_attempts")
public class ScanAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id")
    private Ticket ticket;

    @Column(nullable = false)
    private String result;

    @Column(name = "scanned_by")
    private String scannedBy;

    @Column(name = "scanned_at", nullable = false)
    private LocalDateTime scannedAt = LocalDateTime.now();

    public ScanAttempt() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Ticket getTicket() { return ticket; }
    public void setTicket(Ticket ticket) { this.ticket = ticket; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public String getScannedBy() { return scannedBy; }
    public void setScannedBy(String scannedBy) { this.scannedBy = scannedBy; }

    public LocalDateTime getScannedAt() { return scannedAt; }
    public void setScannedAt(LocalDateTime scannedAt) { this.scannedAt = scannedAt; }
}
