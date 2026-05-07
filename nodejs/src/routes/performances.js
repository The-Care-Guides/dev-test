const express = require('express');
const prisma = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const performances = await prisma.performance.findMany();
    res.json(performances);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const performance = await prisma.performance.findUnique({ where: { id } });
    if (!performance) throw new Error(`Performance not found: ${id}`);
    res.json(performance);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
