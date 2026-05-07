package com.ttg.orderservice;

import com.ttg.orderservice.dto.CreateOrderRequest;
import com.ttg.orderservice.dto.OrderResponse;
import com.ttg.orderservice.entity.Order;
import com.ttg.orderservice.service.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class OrderServiceApplicationTests {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private OrderService orderService;

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    @Test
    void contextLoads() {
    }

    @Test
    void shouldGetExistingOrder() {
        ResponseEntity<OrderResponse> response = restTemplate.getForEntity(
                url("/api/orders/1"), OrderResponse.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("John Smith", response.getBody().getCustomerName());
        assertEquals("CONFIRMED", response.getBody().getStatus());
    }

    @Test
    void shouldListAllOrders() {
        ResponseEntity<OrderResponse[]> response = restTemplate.getForEntity(
                url("/api/orders"), OrderResponse[].class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().length >= 5);
    }

    @Test
    void shouldCreateOrder() {
        CreateOrderRequest request = new CreateOrderRequest();
        request.setCustomerName("Test User");
        request.setCustomerEmail("test@example.com");

        CreateOrderRequest.TicketRequest ticket = new CreateOrderRequest.TicketRequest();
        ticket.setPerformanceId(1L);
        ticket.setSection("Balcony");
        ticket.setSeatRow("A");
        ticket.setSeatNumber(1);
        request.setTickets(List.of(ticket));

        ResponseEntity<OrderResponse> response = restTemplate.postForEntity(
                url("/api/orders"), request, OrderResponse.class);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("PENDING", response.getBody().getStatus());
        assertEquals(1, response.getBody().getTickets().size());
    }

    @Test
    void shouldConfirmOrder() {
        // Create an order first
        CreateOrderRequest request = new CreateOrderRequest();
        request.setCustomerName("Confirm Test");
        request.setCustomerEmail("confirm@example.com");

        CreateOrderRequest.TicketRequest ticket = new CreateOrderRequest.TicketRequest();
        ticket.setPerformanceId(2L);
        ticket.setSection("Stalls");
        ticket.setSeatRow("F");
        ticket.setSeatNumber(5);
        request.setTickets(List.of(ticket));

        OrderResponse created = restTemplate.postForObject(
                url("/api/orders"), request, OrderResponse.class);

        // Confirm it
        ResponseEntity<OrderResponse> response = restTemplate.postForEntity(
                url("/api/orders/" + created.getId() + "/confirm"),
                java.util.Map.of("paymentReference", "PAY-TEST-123"),
                OrderResponse.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("CONFIRMED", response.getBody().getStatus());
    }

    @Test
    void shouldGetPerformances() {
        ResponseEntity<Object[]> response = restTemplate.getForEntity(
                url("/api/performances"), Object[].class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().length >= 4);
    }
}
