package com.ttg.orderservice.controller;

import com.ttg.orderservice.dto.CreateOrderRequest;
import com.ttg.orderservice.dto.OrderResponse;
import com.ttg.orderservice.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<OrderResponse> listOrders(@RequestParam(required = false) String email) {
        if (email != null) {
            return orderService.getOrdersByEmail(email).stream()
                    .map(OrderResponse::from)
                    .toList();
        }
        return orderService.getAllOrders().stream()
                .map(OrderResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public OrderResponse getOrder(@PathVariable Long id) {
        return OrderResponse.from(orderService.getOrder(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return OrderResponse.from(orderService.createOrder(request));
    }

    @PostMapping("/{id}/confirm")
    public OrderResponse confirmOrder(@PathVariable Long id,
                                      @RequestBody Map<String, String> body) {
        String paymentReference = body.get("paymentReference");
        if (paymentReference == null || paymentReference.isBlank()) {
            throw new RuntimeException("paymentReference is required");
        }
        return OrderResponse.from(orderService.confirmOrder(id, paymentReference));
    }

    @PostMapping("/{id}/cancel")
    public OrderResponse cancelOrder(@PathVariable Long id) {
        return OrderResponse.from(orderService.cancelOrder(id));
    }
}
