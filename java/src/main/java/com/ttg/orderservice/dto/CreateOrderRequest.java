package com.ttg.orderservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class CreateOrderRequest {

    @NotBlank
    private String customerName;

    @NotBlank
    @Email
    private String customerEmail;

    @NotEmpty
    @Valid
    private List<TicketRequest> tickets;

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public List<TicketRequest> getTickets() { return tickets; }
    public void setTickets(List<TicketRequest> tickets) { this.tickets = tickets; }

    public static class TicketRequest {
        @jakarta.validation.constraints.NotNull
        private Long performanceId;

        @NotBlank
        private String section;

        private String seatRow;
        private Integer seatNumber;

        public Long getPerformanceId() { return performanceId; }
        public void setPerformanceId(Long performanceId) { this.performanceId = performanceId; }

        public String getSection() { return section; }
        public void setSection(String section) { this.section = section; }

        public String getSeatRow() { return seatRow; }
        public void setSeatRow(String seatRow) { this.seatRow = seatRow; }

        public Integer getSeatNumber() { return seatNumber; }
        public void setSeatNumber(Integer seatNumber) { this.seatNumber = seatNumber; }
    }
}
