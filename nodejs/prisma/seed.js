const prisma = require('../src/db');
const { OrderStatus, TicketStatus, PerformanceStatus } = require('../src/statuses');

// Timestamps are pinned (not `now()`) so the sample data matches the Java
// implementation's data.sql and stays stable across runs.
async function seed() {
  await prisma.scanAttempt.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.order.deleteMany();
  await prisma.performance.deleteMany();
  await prisma.$executeRaw`DELETE FROM sqlite_sequence`;

  const hamilton = await prisma.performance.create({
    data: { name: 'Hamilton', venue: 'Victoria Palace Theatre', eventDate: new Date('2026-04-15T19:30:00Z'), capacity: 1200, basePrice: 85.0, status: PerformanceStatus.ON_SALE },
  });
  const phantom = await prisma.performance.create({
    data: { name: 'The Phantom of the Opera', venue: "His Majesty's Theatre", eventDate: new Date('2026-04-16T19:30:00Z'), capacity: 1100, basePrice: 65.0, status: PerformanceStatus.ON_SALE },
  });
  const lesmis = await prisma.performance.create({
    data: { name: 'Les Misérables', venue: 'Sondheim Theatre', eventDate: new Date('2026-04-17T14:30:00Z'), capacity: 1000, basePrice: 55.0, status: PerformanceStatus.ON_SALE },
  });
  const wicked = await prisma.performance.create({
    data: { name: 'Wicked', venue: 'Apollo Victoria Theatre', eventDate: new Date('2026-04-20T19:30:00Z'), capacity: 1500, basePrice: 75.0, status: PerformanceStatus.ON_SALE },
  });
  const lionking = await prisma.performance.create({
    data: { name: 'The Lion King', venue: 'Lyceum Theatre', eventDate: new Date('2026-03-10T19:30:00Z'), capacity: 1100, basePrice: 90.0, status: PerformanceStatus.COMPLETED },
  });

  await prisma.order.create({
    data: {
      customerName: 'John Smith',
      customerEmail: 'john.smith@email.com',
      status: OrderStatus.CONFIRMED,
      totalAmount: 170.0,
      paymentReference: 'PAY-001-ABC',
      createdAt: new Date('2026-03-01T10:30:00Z'),
      updatedAt: new Date('2026-03-01T10:35:00Z'),
      tickets: {
        create: [
          { performanceId: hamilton.id, section: 'Stalls', seatRow: 'C', seatNumber: 14, price: 85.0, status: TicketStatus.VALID },
          { performanceId: hamilton.id, section: 'Stalls', seatRow: 'C', seatNumber: 15, price: 85.0, status: TicketStatus.VALID },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      customerName: 'Jane Doe',
      customerEmail: 'jane.doe@email.com',
      status: OrderStatus.CONFIRMED,
      totalAmount: 65.0,
      paymentReference: 'PAY-002-DEF',
      createdAt: new Date('2026-03-02T14:00:00Z'),
      updatedAt: new Date('2026-03-02T14:05:00Z'),
      tickets: {
        create: [
          { performanceId: phantom.id, section: 'Dress Circle', seatRow: 'A', seatNumber: 7, price: 65.0, status: TicketStatus.VALID },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      customerName: 'Bob Wilson',
      customerEmail: 'bob.wilson@email.com',
      status: OrderStatus.PENDING,
      totalAmount: 55.0,
      createdAt: new Date('2026-03-05T09:00:00Z'),
      updatedAt: new Date('2026-03-05T09:00:00Z'),
      tickets: {
        create: [
          { performanceId: lesmis.id, section: 'Grand Circle', seatRow: 'D', seatNumber: 22, price: 55.0, status: TicketStatus.VALID },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      customerName: 'Alice Brown',
      customerEmail: 'alice.brown@email.com',
      status: OrderStatus.CANCELLED,
      totalAmount: 75.0,
      createdAt: new Date('2026-03-06T16:00:00Z'),
      updatedAt: new Date('2026-03-06T16:30:00Z'),
      tickets: {
        create: [
          { performanceId: wicked.id, section: 'Stalls', seatRow: 'B', seatNumber: 10, price: 75.0, status: TicketStatus.CANCELLED },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      customerName: 'Emma Davis',
      customerEmail: 'emma.davis@email.com',
      status: OrderStatus.CONFIRMED,
      totalAmount: 180.0,
      paymentReference: 'PAY-005-GHI',
      createdAt: new Date('2026-03-08T11:00:00Z'),
      updatedAt: new Date('2026-03-08T11:10:00Z'),
      tickets: {
        create: [
          { performanceId: lionking.id, section: 'Royal Circle', seatRow: 'B', seatNumber: 1, price: 90.0, status: TicketStatus.USED },
          { performanceId: lionking.id, section: 'Royal Circle', seatRow: 'B', seatNumber: 2, price: 90.0, status: TicketStatus.USED },
        ],
      },
    },
  });
}

if (require.main === module) {
  seed()
    .then(() => console.log('Seed completed: 5 performances, 5 orders, 7 tickets'))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

module.exports = seed;
