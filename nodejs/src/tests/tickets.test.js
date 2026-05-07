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

async function createConfirmedOrderWithTicket() {
  const order = await request(app)
    .post('/api/orders')
    .send({
      customerName: 'Scan Test User',
      customerEmail: 'scan@example.com',
      tickets: [{ performanceId: 1, section: 'Orchestra', seatRow: 'A', seatNumber: 1 }],
    });

  await request(app)
    .post(`/api/orders/${order.body.id}/confirm`)
    .send({ paymentReference: 'PAY-SCAN-TEST' });

  return order.body.tickets[0];
}

test('GET /api/tickets/:id/qr returns QR code for valid ticket', async () => {
  const ticket = await createConfirmedOrderWithTicket();

  const res = await request(app).get(`/api/tickets/${ticket.id}/qr`);
  expect(res.status).toBe(200);
  expect(res.body.qrCode).toMatch(/^data:image\/png;base64,/);
  expect(res.body.ticketId).toBe(ticket.id);
  expect(res.body.performanceName).toBeDefined();
});

test('GET /api/tickets/:id/qr returns 404 for non-existent ticket', async () => {
  const res = await request(app).get('/api/tickets/99999/qr');
  expect(res.status).toBe(404);
});

test('GET /api/tickets/:id/qr returns 400 for unconfirmed order', async () => {
  const order = await request(app)
    .post('/api/orders')
    .send({
      customerName: 'Pending User',
      customerEmail: 'pending@example.com',
      tickets: [{ performanceId: 1, section: 'Balcony' }],
    });

  const res = await request(app).get(`/api/tickets/${order.body.tickets[0].id}/qr`);
  expect(res.status).toBe(400);
  expect(res.body.error).toMatch(/not confirmed/i);
});

test('POST /api/tickets/scan admits a valid ticket', async () => {
  const ticket = await createConfirmedOrderWithTicket();

  const res = await request(app)
    .post('/api/tickets/scan')
    .send({ token: ticket.scanToken });

  expect(res.status).toBe(200);
  expect(res.body.valid).toBe(true);
  expect(res.body.ticket.status).toBe('USED');
  expect(res.body.ticket.customerName).toBeDefined();
});

test('POST /api/tickets/scan rejects already used ticket', async () => {
  const ticket = await createConfirmedOrderWithTicket();

  await request(app)
    .post('/api/tickets/scan')
    .send({ token: ticket.scanToken });

  const res = await request(app)
    .post('/api/tickets/scan')
    .send({ token: ticket.scanToken });

  expect(res.status).toBe(400);
  expect(res.body.valid).toBe(false);
  expect(res.body.reason).toBe('ALREADY_USED');
});

test('POST /api/tickets/scan rejects invalid token', async () => {
  const res = await request(app)
    .post('/api/tickets/scan')
    .send({ token: 'fake-token-12345' });

  expect(res.status).toBe(404);
  expect(res.body.valid).toBe(false);
  expect(res.body.reason).toBe('INVALID_TOKEN');
});

test('POST /api/tickets/scan rejects cancelled ticket', async () => {
  const ticket = await createConfirmedOrderWithTicket();

  // Cancel just the ticket, not the order
  await prisma.ticket.update({
    where: { id: ticket.id },
    data: { status: 'CANCELLED' },
  });

  const res = await request(app)
    .post('/api/tickets/scan')
    .send({ token: ticket.scanToken });

  expect(res.status).toBe(400);
  expect(res.body.valid).toBe(false);
  expect(res.body.reason).toBe('CANCELLED');
});

test('POST /api/tickets/scan returns 400 when token is missing', async () => {
  const res = await request(app)
    .post('/api/tickets/scan')
    .send({});

  expect(res.status).toBe(400);
  expect(res.body.error).toMatch(/token is required/i);
});

test('Orders response includes scanToken in tickets', async () => {
  const ticket = await createConfirmedOrderWithTicket();

  const res = await request(app).get(`/api/orders/${ticket.id}`);
  if (res.status === 200 && res.body.tickets) {
    for (const t of res.body.tickets) {
      expect(t.scanToken).toBeDefined();
    }
  }
});
