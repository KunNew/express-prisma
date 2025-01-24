import { Router } from 'express';
import {
  getNextSequence,
  getCurrentSequence,
  decrementSequence,
  resetSequence,
  getNextSequenceWithPrefix,
} from '@/controllers/counter';

const counterRouter = Router();

// Get current sequence - placing this first to avoid conflicts
counterRouter.get('/sequence/:counterName/current', async (req, res) => {
  const { counterName } = req.params;
  const sequence = await getCurrentSequence(counterName);
  res.json({ sequence });
});

// Get next sequence with prefix
counterRouter.get('/sequence/:counterName/prefix', async (req, res) => {
  const { counterName } = req.params;
  const { prefix = '', padding = 4, initial = 0 } = req.query;
  const sequence = await getNextSequenceWithPrefix(
    counterName,
    prefix as string,
    Number(padding),
    Number(initial)
  );
  res.json({ sequence });
});

// Get next sequence number
counterRouter.get('/sequence/:counterName', async (req, res) => {
  const { counterName } = req.params;
  const { initial = 0 } = req.query;
  const sequence = await getNextSequence(counterName, Number(initial));
  res.json({ sequence });
});

// Decrement sequence
counterRouter.post('/sequence/:counterName/decrement', async (req, res) => {
  const { counterName } = req.params;
  const sequence = await decrementSequence(counterName);
  res.json({ sequence });
});

// Reset sequence
counterRouter.post('/sequence/:counterName/reset', async (req, res) => {
  const { counterName } = req.params;
  const { value = 0 } = req.body;
  const sequence = await resetSequence(counterName, Number(value));
  res.json({ sequence });
});

export default counterRouter;