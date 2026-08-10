# Order Service

A backend service for managing theater ticket orders. Built with Spring Boot and H2 (in-memory database).

Your task is in [TICKET.md](TICKET.md).

## Prerequisites

- Java 17+
- Maven 3.8+

## Running

```bash
./mvnw spring-boot:run
```

The service starts on `http://localhost:8080`.

## Identity

Authentication is stubbed. The `identity` package resolves a header off each request into a controller method parameter — `Customer` from `X-Customer-Email`, `Staff` from `X-Staff-Id` — passing `null` when the header is absent:

```java
@GetMapping("/example")
public String example(Customer customer) { ... }
```

Nothing is verified and no request is rejected. The endpoints below predate the stub and ignore it.

## API Endpoints

### Performances

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/performances` | List all performances |
| GET | `/api/performances/{id}` | Get a specific performance |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List all orders (optional `?email=` filter) |
| GET | `/api/orders/{id}` | Get order with tickets |
| POST | `/api/orders` | Create a new order |
| POST | `/api/orders/{id}/confirm` | Confirm order with payment reference |
| POST | `/api/orders/{id}/cancel` | Cancel an order |

### Create Order Example

```json
POST /api/orders
{
  "customerName": "John Smith",
  "customerEmail": "john@example.com",
  "tickets": [
    {
      "performanceId": 1,
      "section": "Stalls",
      "seatRow": "C",
      "seatNumber": 14
    }
  ]
}
```

### Confirm Order Example

```json
POST /api/orders/1/confirm
{
  "paymentReference": "PAY-001-ABC"
}
```

## Database

The service uses an H2 in-memory database. The H2 console is available at `http://localhost:8080/h2-console` with:
- JDBC URL: `jdbc:h2:mem:orderdb`
- Username: `sa`
- Password: *(empty)*

Sample data is loaded on startup with 5 performances, 5 orders, and 7 tickets.

## Running Tests

```bash
./mvnw test
```
