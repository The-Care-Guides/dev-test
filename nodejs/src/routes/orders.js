const express = require('express');
const { z } = require('zod');
const prisma = require('../db');

const router = express.Router();

const CreateOrderSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  tickets: z
    .array(
      z.object({
        performanceId: z.number().int().positive(),
        section: z.string().min(1),
        seatRow: z.string().optional(),
        seatNumber: z.number().int().positive().optional(),
      })
    )
    .min(1),
});

function formatOrder(order) {
  return {
    id: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    status: order.status,
    totalAmount: order.totalAmount,
    paymentReference: order.paymentReference,
    createdAt: order.createdAt,
    tickets:
      order.tickets?.map((t) => ({
        id: t.id,
        performanceId: t.performanceId,
        performanceName: t.performance?.name,
        section: t.section,
        seatRow: t.seatRow,
        seatNumber: t.seatNumber,
        price: t.price,
        status: t.status,
        scanToken: t.scanToken,
      })) ?? [],
  };
}

const ticketInclude = { tickets: { include: { performance: true } } };

router.get('/', async (req, res, next) => {
  try {
    const where = req.query.email ? { customerEmail: req.query.email } : {};
    const orders = await prisma.order.findMany({ where, include: ticketInclude });
    res.json(orders.map(formatOrder));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: ticketInclude,
    });
    if (!order) throw new Error(`Order not found: ${req.params.id}`);
    res.json(formatOrder(order));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = CreateOrderSchema.parse(req.body);

    let total = 0;
    const ticketData = [];

    for (const t of body.tickets) {
      const performance = await prisma.performance.findUnique({ where: { id: t.performanceId } });
      if (!performance) throw new Error(`Performance not found: ${t.performanceId}`);
      if (performance.status !== 'ON_SALE') {
        throw new Error(`Performance is not on sale: ${performance.name}`);
      }
      total += performance.basePrice;
      ticketData.push({
        performanceId: t.performanceId,
        section: t.section,
        seatRow: t.seatRow ?? null,
        seatNumber: t.seatNumber ?? null,
        price: performance.basePrice,
        status: 'VALID',
      });
    }

    const order = await prisma.order.create({
      data: {
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        status: 'PENDING',
        totalAmount: total,
        tickets: { create: ticketData },
      },
      include: ticketInclude,
    });

    res.status(201).json(formatOrder(order));
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    next(err);
  }
});

router.post('/:id/confirm', async (req, res, next) => {
  try {
    const { paymentReference } = req.body;
    if (!paymentReference || !String(paymentReference).trim()) {
      throw new Error('paymentReference is required');
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: ticketInclude,
    });
    if (!order) throw new Error(`Order not found: ${req.params.id}`);
    if (order.status !== 'PENDING') {
      throw new Error(`Order cannot be confirmed in status: ${order.status}`);
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CONFIRMED', paymentReference },
      include: ticketInclude,
    });

    res.json(formatOrder(updated));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/cancel', async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: ticketInclude,
    });
    if (!order) throw new Error(`Order not found: ${req.params.id}`);
    if (order.status === 'CANCELLED') {
      throw new Error('Order is already cancelled');
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.ticket.updateMany({
        where: { orderId: order.id },
        data: { status: 'CANCELLED' },
      });
      return tx.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
        include: ticketInclude,
      });
    });

    res.json(formatOrder(updated));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
