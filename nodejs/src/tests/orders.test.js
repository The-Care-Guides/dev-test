const request = require('supertest');
const app = require('../app');
const prisma = require('../db');

beforeAll(async () => {
  const count = await prisma.performance.count();
  if (count === 0) throw new Error('Run "npm run db:setup" before running tests');
});

afterAll(async () => {
  await prisma.$disconnect();
});

test('GET /api/performances returns all performances', async () => {
  const res = await request(app).get('/api/performances');
  expect(res.status).toBe(200);
  expect(res.body.length).toBeGreaterThanOrEqual(4);
});

test('GET /api/orders returns all orders', async () => {
  const res = await request(app).get('/api/orders');
  expect(res.status).toBe(200);
  expect(res.body.length).toBeGreaterThanOrEqual(5);
});

test('GET /api/orders/1 returns order with tickets', async () => {
  const res = await request(app).get('/api/orders/1');
  expect(res.status).toBe(200);
  expect(res.body.customerName).toBe('John Smith');
  expect(res.body.status).toBe('CONFIRMED');
  expect(res.body.tickets.length).toBeGreaterThanOrEqual(1);
});

test('POST /api/orders creates a new order', async () => {
  const res = await request(app)
    .post('/api/orders')
    .send({
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      tickets: [{ performanceId: 1, section: 'Balcony', seatRow: 'A', seatNumber: 99 }],
    });
  expect(res.status).toBe(201);
  expect(res.body.status).toBe('PENDING');
  expect(res.body.tickets).toHaveLength(1);
});

test('POST /api/orders/:id/confirm confirms a pending order', async () => {
  const created = await request(app)
    .post('/api/orders')
    .send({
      customerName: 'Confirm Test',
      customerEmail: 'confirm@example.com',
      tickets: [{ performanceId: 2, section: 'Stalls', seatRow: 'F', seatNumber: 5 }],
    });

  const res = await request(app)
    .post(`/api/orders/${created.body.id}/confirm`)
    .send({ paymentReference: 'PAY-TEST-123' });

  expect(res.status).toBe(200);
  expect(res.body.status).toBe('CONFIRMED');
  expect(res.body.paymentReference).toBe('PAY-TEST-123');
});
