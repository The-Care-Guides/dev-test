const prisma = require('../db');
const { OrderStatus, TicketStatus, PerformanceStatus } = require('../statuses');

const ticketInclude = { tickets: { include: { performance: true } } };

async function getOrder(id) {
  const order = await prisma.order.findUnique({ where: { id }, include: ticketInclude });
  if (!order) throw new Error(`Order not found: ${id}`);
  return order;
}

async function getAllOrders() {
  return prisma.order.findMany({ include: ticketInclude });
}

async function getOrdersByEmail(email) {
  return prisma.order.findMany({ where: { customerEmail: email }, include: ticketInclude });
}

async function createOrder(request) {
  let total = 0;
  const ticketData = [];

  for (const t of request.tickets) {
    const performance = await prisma.performance.findUnique({ where: { id: t.performanceId } });
    if (!performance) throw new Error(`Performance not found: ${t.performanceId}`);
    if (performance.status !== PerformanceStatus.ON_SALE) {
      throw new Error(`Performance is not on sale: ${performance.name}`);
    }

    total += performance.basePrice;
    ticketData.push({
      performanceId: t.performanceId,
      section: t.section,
      seatRow: t.seatRow ?? null,
      seatNumber: t.seatNumber ?? null,
      price: performance.basePrice,
      status: TicketStatus.VALID,
    });
  }

  return prisma.order.create({
    data: {
      customerName: request.customerName,
      customerEmail: request.customerEmail,
      status: OrderStatus.PENDING,
      totalAmount: total,
      tickets: { create: ticketData },
    },
    include: ticketInclude,
  });
}

async function confirmOrder(id, paymentReference) {
  const order = await getOrder(id);

  if (order.status !== OrderStatus.PENDING) {
    throw new Error(`Order cannot be confirmed in status: ${order.status}`);
  }

  return prisma.order.update({
    where: { id: order.id },
    data: { status: OrderStatus.CONFIRMED, paymentReference },
    include: ticketInclude,
  });
}

async function cancelOrder(id) {
  const order = await getOrder(id);

  if (order.status === OrderStatus.CANCELLED) {
    throw new Error('Order is already cancelled');
  }

  return prisma.$transaction(async (tx) => {
    await tx.ticket.updateMany({
      where: { orderId: order.id },
      data: { status: TicketStatus.CANCELLED },
    });
    return tx.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.CANCELLED },
      include: ticketInclude,
    });
  });
}

async function getTicketsForPerformance(performanceId) {
  return prisma.ticket.findMany({ where: { performanceId } });
}

module.exports = {
  getOrder,
  getAllOrders,
  getOrdersByEmail,
  createOrder,
  confirmOrder,
  cancelOrder,
  getTicketsForPerformance,
};
