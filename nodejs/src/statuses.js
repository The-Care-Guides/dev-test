// Status vocabularies for the domain.
//
// SQLite has no enum type and Prisma cannot declare enums against a SQLite
// datasource, so the allowed values live here and are applied by the service
// layer. Keep in sync with the doc comments in prisma/schema.prisma.

const OrderStatus = Object.freeze({
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
});

const TicketStatus = Object.freeze({
  VALID: 'VALID',
  USED: 'USED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
});

const PerformanceStatus = Object.freeze({
  SCHEDULED: 'SCHEDULED',
  ON_SALE: 'ON_SALE',
  SOLD_OUT: 'SOLD_OUT',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
});

module.exports = { OrderStatus, TicketStatus, PerformanceStatus };
