# Order Service

A backend service for managing theater ticket orders. Built with Node.js, Express, and SQLite.

Your task is in [TICKET.md](TICKET.md).

## Prerequisites

- Node.js 18+

## Setup

```bash
npm install
npm run db:setup
```

## Running

```bash
npm start
```

The service starts on `http://localhost:3000`.

## Identity

Authentication is stubbed. `src/identity.js` reads a header off each request and attaches the claimed identity — `req.customer` from `X-Customer-Email`, `req.staff` from `X-Staff-Id` — leaving both `null` when the header is absent. Nothing is verified and no request is rejected.

The endpoints below predate the stub and ignore it.

## API Endpoints

### Performances

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/performances` | List all performances |
| GET | `/api/performances/:id` | Get a specific performance |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List all orders (optional `?email=` filter) |
| GET | `/api/orders/:id` | Get order with tickets |
| POST | `/api/orders` | Create a new order |
| POST | `/api/orders/:id/confirm` | Confirm order with payment reference |
| POST | `/api/orders/:id/cancel` | Cancel an order |

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

SQLite database at `prisma/dev.db`. Sample data is loaded on setup with 5 performances, 5 orders, and 7 tickets.

## Running Tests

```bash
npm test
```
