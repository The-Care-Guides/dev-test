package com.ttg.orderservice.dto;

import com.ttg.orderservice.entity.Order;
import com.ttg.orderservice.entity.Ticket;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {

    private Long id;
    private String customerName;
    private String customerEmail;
    private String status;
    private BigDecimal totalAmount;
    private String paymentReference;
    private LocalDateTime createdAt;
    private List<TicketResponse> tickets;

    public static OrderResponse from(Order order) {
        OrderResponse response = new OrderResponse();
        response.id = order.getId();
        response.customerName = order.getCustomerName();
        response.customerEmail = order.getCustomerEmail();
        response.status = order.getStatus().name();
        response.totalAmount = order.getTotalAmount();
        response.paymentReference = order.getPaymentReference();
        response.createdAt = order.getCreatedAt();
        response.tickets = order.getTickets().stream()
                .map(TicketResponse::from)
                .toList();
        return response;
    }

    public Long getId() { return id; }
    public String getCustomerName() { return customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public String getStatus() { return status; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public String getPaymentReference() { return paymentReference; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<TicketResponse> getTickets() { return tickets; }

    public static class TicketResponse {
        private Long id;
        private Long performanceId;
        private String performanceName;
        private String section;
        private String seatRow;
        private Integer seatNumber;
        private BigDecimal price;
        private String status;

        public static TicketResponse from(Ticket ticket) {
            TicketResponse r = new TicketResponse();
            r.id = ticket.getId();
            r.performanceId = ticket.getPerformance().getId();
            r.performanceName = ticket.getPerformance().getName();
            r.section = ticket.getSection();
            r.seatRow = ticket.getSeatRow();
            r.seatNumber = ticket.getSeatNumber();
            r.price = ticket.getPrice();
            r.status = ticket.getStatus().name();
            return r;
        }

        public Long getId() { return id; }
        public Long getPerformanceId() { return performanceId; }
        public String getPerformanceName() { return performanceName; }
        public String getSection() { return section; }
        public String getSeatRow() { return seatRow; }
        public Integer getSeatNumber() { return seatNumber; }
        public BigDecimal getPrice() { return price; }
        public String getStatus() { return status; }
    }
}
