const express = require('express');
const { z } = require('zod');
const orderService = require('../services/orderService');

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

// Renders a zod issue path the same way Spring renders a field path, so both
// implementations report validation failures identically: tickets[0].section
function formatPath(path) {
  return path.reduce(
    (acc, segment) =>
      typeof segment === 'number' ? `${acc}[${segment}]` : acc ? `${acc}.${segment}` : String(segment),
    ''
  );
}

function validationError(res, err) {
  return res.status(400).json({
    error: 'Validation failed',
    details: err.errors.map((e) => ({ path: formatPath(e.path), message: e.message })),
  });
}

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
      })) ?? [],
  };
}

router.get('/', async (req, res, next) => {
  try {
    const orders = req.query.email
      ? await orderService.getOrdersByEmail(req.query.email)
      : await orderService.getAllOrders();
    res.json(orders.map(formatOrder));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await orderService.getOrder(parseInt(req.params.id));
    res.json(formatOrder(order));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = CreateOrderSchema.parse(req.body);
    const order = await orderService.createOrder(body);
    res.status(201).json(formatOrder(order));
  } catch (err) {
    if (err.name === 'ZodError') {
      return validationError(res, err);
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

    const order = await orderService.confirmOrder(parseInt(req.params.id), paymentReference);
    res.json(formatOrder(order));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/cancel', async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(parseInt(req.params.id));
    res.json(formatOrder(order));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
