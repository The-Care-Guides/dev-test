const express = require('express');
const ordersRouter = require('./routes/orders');
const performancesRouter = require('./routes/performances');
const ticketsRouter = require('./routes/tickets');

const app = express();

app.use(express.json());
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
