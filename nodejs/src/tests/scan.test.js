const request = require('supertest');
const app = require('../app');
const prisma = require('../db');

// Stable scan codes from prisma/seed.js. Keeping them inline so the tests are
// self-documenting — anyone reading the test sees exactly which seeded ticket
// is being exercised.
const CODES = {
  johnSmithA: '11111111-1111-4111-8111-111111111111', // Hamilton, VALID, order CONFIRMED
  johnSmithB: '22222222-2222-4222-8222-222222222222', // Hamilton, VALID, order CONFIRMED
  bobWilson: '44444444-4444-4444-8444-444444444444',  // Les Mis, VALID but order PENDING
  aliceBrown: '55555555-5555-4555-8555-555555555555', // Wicked, ticket CANCELLED
  emmaDavisA: '66666666-6666-4666-8666-666666666666', // Lion King, already USED
};

beforeAll(async () => {
  const count = await prisma.performance.count();
  if (count === 0) throw new Error('Run "npm run db:setup" before running tests');
});

// Reset the seeded tickets we mutate so the suite is rerunnable without
// having to seed the DB again between runs. Only touches rows the tests own.
afterEach(async () => {
  await prisma.ticket.updateMany({
    where: { scanCode: { in: [CODES.johnSmithA, CODES.johnSmithB] } },
    data: { status: 'VALID', usedAt: null, scannedBy: null },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/tickets/scan', () => {
  test('admits a valid ticket and marks it USED', async () => {
    const res = await request(app)
      .post('/api/tickets/scan')
      .send({ scanCode: CODES.johnSmithA, staffId: 'staff-test-1' });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe('ADMIT');
    expect(res.body.ticket.status).toBe('USED');
    expect(res.body.ticket.scannedBy).toBe('staff-test-1');
    expect(res.body.ticket.usedAt).toBeTruthy();
  });

  test('rejects a second scan of the same ticket as ALREADY_USED', async () => {
    await request(app).post('/api/tickets/scan').send({ scanCode: CODES.johnSmithB });
    const res = await request(app).post('/api/tickets/scan').send({ scanCode: CODES.johnSmithB });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe('ALREADY_USED');
    expect(res.body.ticket.status).toBe('USED');
    expect(res.body.reason).toMatch(/already scanned/i);
  });

  test('rejects a ticket whose order was cancelled', async () => {
    const res = await request(app)
      .post('/api/tickets/scan')
      .send({ scanCode: CODES.aliceBrown });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe('INVALID');
    expect(res.body.reason).toMatch(/cancelled/i);
  });

  test('rejects a ticket already used in a previous show', async () => {
    const res = await request(app)
      .post('/api/tickets/scan')
      .send({ scanCode: CODES.emmaDavisA });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe('ALREADY_USED');
  });

  test('returns 404 for an unknown scan code', async () => {
    const res = await request(app)
      .post('/api/tickets/scan')
      .send({ scanCode: '00000000-0000-4000-8000-000000000000' });

    expect(res.status).toBe(404);
    expect(res.body.result).toBe('INVALID');
  });

  test('returns 400 when body is missing scanCode', async () => {
    const res = await request(app).post('/api/tickets/scan').send({});
    expect(res.status).toBe(400);
    expect(res.body.result).toBe('INVALID');
  });

  test('is safe under concurrent scans (only one ADMIT)', async () => {
    // Fire two scans for the same code at the same time and assert exactly one
    // wins. This catches regressions that would let a ticket be admitted
    // twice if the VALID->USED transition is not atomic.
    const [a, b] = await Promise.all([
      request(app).post('/api/tickets/scan').send({ scanCode: CODES.johnSmithA }),
      request(app).post('/api/tickets/scan').send({ scanCode: CODES.johnSmithA }),
    ]);

    const results = [a.body.result, b.body.result].sort();
    expect(results).toEqual(['ADMIT', 'ALREADY_USED']);
  });
});

describe('GET /api/tickets/:scanCode', () => {
  test('returns ticket details without mutating status', async () => {
    const res = await request(app).get(`/api/tickets/${CODES.johnSmithA}`);
    expect(res.status).toBe(200);
    expect(res.body.ticket.status).toBe('VALID');
    expect(res.body.ticket.performanceName).toBe('Hamilton');

    // Confirm the read did not flip the row.
    const after = await prisma.ticket.findUnique({ where: { scanCode: CODES.johnSmithA } });
    expect(after.status).toBe('VALID');
  });

  test('returns 404 for unknown code', async () => {
    const res = await request(app).get('/api/tickets/does-not-exist-xxxxx');
    expect(res.status).toBe(404);
  });
});

describe('scanCode visibility on orders', () => {
  test('CONFIRMED order exposes scanCode on its tickets', async () => {
    const res = await request(app).get('/api/orders/1');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('CONFIRMED');
    expect(res.body.tickets[0].scanCode).toBeTruthy();
  });

  test('PENDING order does not expose scanCode', async () => {
    const res = await request(app).get('/api/orders/3');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('PENDING');
    expect(res.body.tickets[0].scanCode).toBeUndefined();
  });

  test('CANCELLED order does not expose scanCode', async () => {
    const res = await request(app).get('/api/orders/4');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('CANCELLED');
    expect(res.body.tickets[0].scanCode).toBeUndefined();
  });
});
