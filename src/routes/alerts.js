const router = require('express').Router();
const { alerts } = require('../data/db');
const { authenticate } = require('../middleware/auth');

// GET /api/alerts
router.get('/', authenticate, (req, res) => {
  const { type, unread } = req.query;
  let result = [...alerts];

  if (type) result = result.filter(a => a.type === type);
  if (unread === 'true') result = result.filter(a => !a.isRead);

  res.json(result);
});

// PATCH /api/alerts/:id/read
router.patch('/:id/read', authenticate, (req, res) => {
  const alert = alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found.' });
  alert.isRead = true;
  res.json(alert);
});

// PATCH /api/alerts/read-all
router.patch('/read-all', authenticate, (req, res) => {
  alerts.forEach(a => { a.isRead = true; });
  res.json({ message: 'All alerts marked as read.' });
});

module.exports = router;
