const express = require('express');
const { z } = require('zod');
const prisma = require('../db');

const router = express.Router();

// Body sent by the venue scanning app. staffId is optional today (no auth yet)
// but accepted so the audit trail is populated when the caller can supply it.
const ScanSchema = z.object({
  scanCode: z.string().min(8),
  staffId: z.string().min(1).optional(),
});

// Possible decisions returned to the scanning app. Kept as a flat string union
// so the staff client can switch on it directly without parsing nested errors.
const Result = {
  ADMIT: 'ADMIT',
  ALREADY_USED: 'ALREADY_USED',
  INVALID: 'INVALID',
};

function publicTicket(ticket) {
  if (!ticket) return null;
  return {
    id: ticket.id,
    orderId: ticket.orderId,
    performanceId: ticket.performanceId,
    performanceName: ticket.performance?.name,
    eventDate: ticket.performance?.eventDate,
    venue: ticket.performance?.venue,
    section: ticket.section,
    seatRow: ticket.seatRow,
    seatNumber: ticket.seatNumber,
    status: ticket.status,
    usedAt: ticket.usedAt,
    scannedBy: ticket.scannedBy,
    customerName: ticket.order?.customerName,
  };
}

const ticketInclude = { performance: true, order: true };

// Read-only preview of a ticket by its scan code. Lets the scanning app render
// seat info before the staff member commits to marking the ticket as used.
router.get('/:scanCode', async (req, res, next) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { scanCode: req.params.scanCode },
      include: ticketInclude,
    });
    if (!ticket) {
      return res.status(404).json({ result: Result.INVALID, reason: 'Ticket not found' });
    }
    res.json({ ticket: publicTicket(ticket) });
  } catch (err) {
    next(err);
  }
});

// Scan-and-burn endpoint. Atomically transitions a VALID ticket to USED and
// returns the staff-facing decision. Idempotent under concurrent scans: only
// the first request will flip the row, the rest see ALREADY_USED.
router.post('/scan', async (req, res, next) => {
  try {
    const body = ScanSchema.parse(req.body);
    const scannedAt = new Date();

    // Conditional update: only the row matching scanCode AND status=VALID is
    // touched. updateMany returns { count }, which tells us whether THIS call
    // was the winner of the race. No transaction needed — the WHERE clause
    // does the locking for us at the SQL level.
    const { count } = await prisma.ticket.updateMany({
      where: { scanCode: body.scanCode, status: 'VALID' },
      data: {
        status: 'USED',
        usedAt: scannedAt,
        scannedBy: body.staffId ?? 'unknown',
      },
    });

    // Re-read regardless of outcome so we can give the staff member context
    // (which seat, when it was previously used, etc.).
    const ticket = await prisma.ticket.findUnique({
      where: { scanCode: body.scanCode },
      include: ticketInclude,
    });

    if (!ticket) {
      // The code does not match any ticket. Return 404 — this is the only
      // genuinely unexpected outcome (forged QR, typo, wrong venue).
      return res.status(404).json({ result: Result.INVALID, reason: 'Ticket not found' });
    }

    if (count === 1) {
      // We won the race and flipped VALID -> USED.
      return res.json({
        result: Result.ADMIT,
        ticket: publicTicket(ticket),
      });
    }

    // count === 0: ticket exists but was not VALID. Disambiguate the reason
    // so the staff client can show the right message.
    if (ticket.status === 'USED') {
      return res.json({
        result: Result.ALREADY_USED,
        reason: `Ticket already scanned at ${ticket.usedAt?.toISOString()}`,
        ticket: publicTicket(ticket),
      });
    }

    // CANCELLED / EXPIRED / order not CONFIRMED / unknown future state.
    let reason;
    if (ticket.status === 'CANCELLED') reason = 'Ticket was cancelled';
    else if (ticket.status === 'EXPIRED') reason = 'Ticket has expired';
    else reason = `Ticket is not valid (status=${ticket.status})`;

    return res.json({
      result: Result.INVALID,
      reason,
      ticket: publicTicket(ticket),
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ result: Result.INVALID, reason: 'Validation failed', details: err.errors });
    }
    next(err);
  }
});

module.exports = router;
