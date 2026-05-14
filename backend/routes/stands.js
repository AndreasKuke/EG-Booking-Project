const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Get all stands for an event
  router.get('/:eventId', async (req, res) => {
    try {
      const { eventId } = req.params;
      const result = await pool.query(
        'SELECT * FROM stands WHERE event_id = $1 ORDER BY row, col',
        [eventId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Get stand details
  router.get('/:eventId/:standId', async (req, res) => {
    try {
      const { eventId, standId } = req.params;
      const result = await pool.query(
        'SELECT * FROM stands WHERE id = $1 AND event_id = $2',
        [standId, eventId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Stand not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Create a new stand (admin only)
  router.post('/', async (req, res) => {
    try {
      const { event_id, row, col, size, price, description } = req.body;
      const result = await pool.query(
        'INSERT INTO stands (event_id, row, col, size, price, description, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [event_id, row, col, size, price, description, 'available']
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Update stand (admin only)
  router.put('/:standId', async (req, res) => {
    try {
      const { standId } = req.params;
      const { size, price, description, status } = req.body;
      const result = await pool.query(
        'UPDATE stands SET size = $1, price = $2, description = $3, status = $4 WHERE id = $5 RETURNING *',
        [size, price, description, status, standId]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  return router;
};
