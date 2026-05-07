const express = require('express');
const ordersRouter = require('./routes/orders');
const performancesRouter = require('./routes/performances');
const ticketsRouter = require('./routes/tickets');

const app = express();

app.use(express.json());

// Health check for uptime probes / load balancers.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root: discoverable index of available endpoints. Saves people from a blank
// 404 when they hit the bare host in a browser.
app.get('/', (req, res) => {
  res.json({
    service: 'order-service',
    endpoints: {
      health: 'GET /health',
      performances: {
        list: 'GET /api/performances',
        get: 'GET /api/performances/:id',
      },
      orders: {
        list: 'GET /api/orders?email=optional',
        get: 'GET /api/orders/:id',
        create: 'POST /api/orders',
        confirm: 'POST /api/orders/:id/confirm',
        cancel: 'POST /api/orders/:id/cancel',
      },
      tickets: {
        preview: 'GET /api/tickets/:scanCode',
        scan: 'POST /api/tickets/scan',
      },
    },
  });
});

app.use('/api/orders', ordersRouter);
app.use('/api/performances', performancesRouter);
app.use('/api/tickets', ticketsRouter);

app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Order service running on http://localhost:${PORT}`);
  });
}

module.exports = app;
