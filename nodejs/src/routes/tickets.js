const express = require('express');
const QRCode = require('qrcode');
const prisma = require('../db');

const router = express.Router();

const ticketInclude = { performance: true, order: true };

router.get('/:id/qr', async (req, res, next) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(req.params.id) },
      include: ticketInclude,
    });

    if (!ticket) {
      return res.status(404).json({ error: `Ticket not found: ${req.params.id}` });
    }

    if (ticket.order.status !== 'CONFIRMED') {
      return res.status(400).json({ error: 'Order is not confirmed' });
    }

    if (ticket.status !== 'VALID') {
      return res.status(400).json({ error: `Ticket is not valid (status: ${ticket.status})` });
    }

    const qrDataUrl = await QRCode.toDataURL(ticket.scanToken);

    res.json({
      ticketId: ticket.id,
      performanceName: ticket.performance.name,
      venue: ticket.performance.venue,
      eventDate: ticket.performance.eventDate,
      section: ticket.section,
      seatRow: ticket.seatRow,
      seatNumber: ticket.seatNumber,
      qrCode: qrDataUrl,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/scan', async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token || !String(token).trim()) {
      return res.status(400).json({ error: 'token is required' });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { scanToken: token },
      include: ticketInclude,
    });

    if (!ticket) {
      return res.status(404).json({ valid: false, reason: 'INVALID_TOKEN' });
    }

    if (ticket.order.status !== 'CONFIRMED') {
      return res.status(400).json({ valid: false, reason: 'ORDER_NOT_CONFIRMED' });
    }

    if (ticket.status === 'USED') {
      return res.status(400).json({ valid: false, reason: 'ALREADY_USED' });
    }

    if (ticket.status === 'CANCELLED') {
      return res.status(400).json({ valid: false, reason: 'CANCELLED' });
    }

    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: 'USED' },
      include: ticketInclude,
    });

    res.json({
      valid: true,
      ticket: {
        id: updated.id,
        performanceName: updated.performance.name,
        venue: updated.performance.venue,
        eventDate: updated.performance.eventDate,
        section: updated.section,
        seatRow: updated.seatRow,
        seatNumber: updated.seatNumber,
        customerName: updated.order.customerName,
        status: updated.status,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
