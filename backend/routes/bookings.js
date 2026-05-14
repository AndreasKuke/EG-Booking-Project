const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Get all bookings for an event
  router.get('/:eventId', async (req, res) => {
    try {
      const { eventId } = req.params;
      const result = await pool.query(
        `SELECT b.*, u.email, u.company_name, s.row, s.col, s.price 
         FROM bookings b
         JOIN users u ON b.user_id = u.id
         JOIN stands s ON b.stand_id = s.id
         WHERE s.event_id = $1
         ORDER BY b.created_at DESC`,
        [eventId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Create a booking
  router.post('/', async (req, res) => {
    try {
      const { user_id, stand_id, event_id } = req.body;

      // Check if stand is available
      const standCheck = await pool.query(
        'SELECT status FROM stands WHERE id = $1',
        [stand_id]
      );
      if (standCheck.rows[0]?.status !== 'available') {
        return res.status(400).json({ error: 'Stand is not available' });
      }

      // Check if stand is already booked
      const bookingCheck = await pool.query(
        'SELECT * FROM bookings WHERE stand_id = $1 AND status = $2',
        [stand_id, 'confirmed']
      );
      if (bookingCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Stand is already booked' });
      }

      // Create booking
      const result = await pool.query(
        `INSERT INTO bookings (user_id, stand_id, event_id, status, created_at) 
         VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
        [user_id, stand_id, event_id, 'confirmed']
      );

      // Update stand status
      await pool.query(
        'UPDATE stands SET status = $1 WHERE id = $2',
        ['booked', stand_id]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Cancel booking
  router.delete('/:bookingId', async (req, res) => {
    try {
      const { bookingId } = req.params;
      
      // Get the stand_id from the booking
      const bookingResult = await pool.query(
        'SELECT stand_id FROM bookings WHERE id = $1',
        [bookingId]
      );
      
      if (bookingResult.rows.length === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      const stand_id = bookingResult.rows[0].stand_id;

      // Delete booking
      await pool.query('DELETE FROM bookings WHERE id = $1', [bookingId]);

      // Update stand status back to available
      await pool.query(
        'UPDATE stands SET status = $1 WHERE id = $2',
        ['available', stand_id]
      );

      res.json({ message: 'Booking cancelled' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  return router;
};
