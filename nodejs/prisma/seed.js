const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Stable scan codes for the seeded tickets so tests and manual QA can rely on
// known values. In production these are generated at ticket creation time.
const SEED_SCAN_CODES = {
  johnSmithA: '11111111-1111-4111-8111-111111111111',
  johnSmithB: '22222222-2222-4222-8222-222222222222',
  janeDoe: '33333333-3333-4333-8333-333333333333',
  bobWilson: '44444444-4444-4444-8444-444444444444',
  aliceBrown: '55555555-5555-4555-8555-555555555555',
  emmaDavisA: '66666666-6666-4666-8666-666666666666',
  emmaDavisB: '77777777-7777-4777-8777-777777777777',
};

async function main() {
  await prisma.ticket.deleteMany();
  await prisma.order.deleteMany();
  await prisma.performance.deleteMany();
  await prisma.$executeRaw`DELETE FROM sqlite_sequence`;

  const hamilton = await prisma.performance.create({
    data: { name: 'Hamilton', venue: 'Victoria Palace Theatre', eventDate: new Date('2026-04-15T19:30:00'), capacity: 1200, basePrice: 85.0, status: 'ON_SALE' },
  });
  const phantom = await prisma.performance.create({
    data: { name: 'The Phantom of the Opera', venue: "His Majesty's Theatre", eventDate: new Date('2026-04-16T19:30:00'), capacity: 1100, basePrice: 65.0, status: 'ON_SALE' },
  });
  const lesmis = await prisma.performance.create({
    data: { name: 'Les Misérables', venue: 'Sondheim Theatre', eventDate: new Date('2026-04-17T14:30:00'), capacity: 1000, basePrice: 55.0, status: 'ON_SALE' },
  });
  const wicked = await prisma.performance.create({
    data: { name: 'Wicked', venue: 'Apollo Victoria Theatre', eventDate: new Date('2026-04-20T19:30:00'), capacity: 1500, basePrice: 75.0, status: 'ON_SALE' },
  });
  const lionking = await prisma.performance.create({
    data: { name: 'The Lion King', venue: 'Lyceum Theatre', eventDate: new Date('2026-03-10T19:30:00'), capacity: 1100, basePrice: 90.0, status: 'COMPLETED' },
  });

  await prisma.order.create({
    data: {
      customerName: 'John Smith',
      customerEmail: 'john.smith@email.com',
      status: 'CONFIRMED',
      totalAmount: 170.0,
      paymentReference: 'PAY-001-ABC',
      tickets: {
        create: [
          { performanceId: hamilton.id, section: 'Stalls', seatRow: 'C', seatNumber: 14, price: 85.0, status: 'VALID', scanCode: SEED_SCAN_CODES.johnSmithA },
          { performanceId: hamilton.id, section: 'Stalls', seatRow: 'C', seatNumber: 15, price: 85.0, status: 'VALID', scanCode: SEED_SCAN_CODES.johnSmithB },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      customerName: 'Jane Doe',
      customerEmail: 'jane.doe@email.com',
      status: 'CONFIRMED',
      totalAmount: 65.0,
      paymentReference: 'PAY-002-DEF',
      tickets: {
        create: [
          { performanceId: phantom.id, section: 'Dress Circle', seatRow: 'A', seatNumber: 7, price: 65.0, status: 'VALID', scanCode: SEED_SCAN_CODES.janeDoe },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      customerName: 'Bob Wilson',
      customerEmail: 'bob.wilson@email.com',
      status: 'PENDING',
      totalAmount: 55.0,
      tickets: {
        create: [
          { performanceId: lesmis.id, section: 'Grand Circle', seatRow: 'D', seatNumber: 22, price: 55.0, status: 'VALID', scanCode: SEED_SCAN_CODES.bobWilson },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      customerName: 'Alice Brown',
      customerEmail: 'alice.brown@email.com',
      status: 'CANCELLED',
      totalAmount: 75.0,
      tickets: {
        create: [
          { performanceId: wicked.id, section: 'Stalls', seatRow: 'B', seatNumber: 10, price: 75.0, status: 'CANCELLED', scanCode: SEED_SCAN_CODES.aliceBrown },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      customerName: 'Emma Davis',
      customerEmail: 'emma.davis@email.com',
      status: 'CONFIRMED',
      totalAmount: 180.0,
      paymentReference: 'PAY-005-GHI',
      tickets: {
        create: [
          { performanceId: lionking.id, section: 'Royal Circle', seatRow: 'B', seatNumber: 1, price: 90.0, status: 'USED', scanCode: SEED_SCAN_CODES.emmaDavisA, usedAt: new Date('2026-03-10T19:05:00'), scannedBy: 'staff-door-1' },
          { performanceId: lionking.id, section: 'Royal Circle', seatRow: 'B', seatNumber: 2, price: 90.0, status: 'USED', scanCode: SEED_SCAN_CODES.emmaDavisB, usedAt: new Date('2026-03-10T19:05:00'), scannedBy: 'staff-door-1' },
        ],
      },
    },
  });

  console.log('Seed completed: 5 performances, 5 orders, 8 tickets');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
