package com.ttg.orderservice.service;

import com.ttg.orderservice.dto.CreateOrderRequest;
import com.ttg.orderservice.entity.Order;
import com.ttg.orderservice.entity.Performance;
import com.ttg.orderservice.entity.Ticket;
import com.ttg.orderservice.repository.OrderRepository;
import com.ttg.orderservice.repository.PerformanceRepository;
import com.ttg.orderservice.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final TicketRepository ticketRepository;
    private final PerformanceRepository performanceRepository;

    public OrderService(OrderRepository orderRepository,
                        TicketRepository ticketRepository,
                        PerformanceRepository performanceRepository) {
        this.orderRepository = orderRepository;
        this.ticketRepository = ticketRepository;
        this.performanceRepository = performanceRepository;
    }

    public Order getOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByEmail(String email) {
        return orderRepository.findByCustomerEmail(email);
    }

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setStatus(Order.OrderStatus.PENDING);

        BigDecimal total = BigDecimal.ZERO;

        for (CreateOrderRequest.TicketRequest ticketReq : request.getTickets()) {
            Performance performance = performanceRepository.findById(ticketReq.getPerformanceId())
                    .orElseThrow(() -> new RuntimeException(
                            "Performance not found: " + ticketReq.getPerformanceId()));

            if (performance.getStatus() != Performance.PerformanceStatus.ON_SALE) {
                throw new RuntimeException("Performance is not on sale: " + performance.getName());
            }

            Ticket ticket = new Ticket();
            ticket.setOrder(order);
            ticket.setPerformance(performance);
            ticket.setSection(ticketReq.getSection());
            ticket.setSeatRow(ticketReq.getSeatRow());
            ticket.setSeatNumber(ticketReq.getSeatNumber());
            ticket.setPrice(performance.getBasePrice());
            ticket.setStatus(Ticket.TicketStatus.VALID);

            order.getTickets().add(ticket);
            total = total.add(performance.getBasePrice());
        }

        order.setTotalAmount(total);
        return orderRepository.save(order);
    }

    @Transactional
    public Order confirmOrder(Long id, String paymentReference) {
        Order order = getOrder(id);

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("Order cannot be confirmed in status: " + order.getStatus());
        }

        order.setStatus(Order.OrderStatus.CONFIRMED);
        order.setPaymentReference(paymentReference);
        return orderRepository.save(order);
    }

    @Transactional
    public Order cancelOrder(Long id) {
        Order order = getOrder(id);

        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new RuntimeException("Order is already cancelled");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        order.getTickets().forEach(t -> t.setStatus(Ticket.TicketStatus.CANCELLED));
        return orderRepository.save(order);
    }

    public List<Ticket> getTicketsForPerformance(Long performanceId) {
        return ticketRepository.findByPerformanceId(performanceId);
    }
}
