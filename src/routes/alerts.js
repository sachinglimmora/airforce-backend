const router = require('express').Router();
const { alerts } = require('../data/db');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Alerts
 *   description: System notifications and training alerts
 */

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: Get all system alerts
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: 'string' }
 *       - in: query
 *         name: unread
 *         schema: { type: 'string', enum: ['true', 'false'] }
 *     responses:
 *       200:
 *         description: List of alerts
 */
router.get('/', authenticate, (req, res) => {
  const { type, unread } = req.query;
  let result = [...alerts];

  if (type) result = result.filter(a => a.type === type);
  if (unread === 'true') result = result.filter(a => !a.isRead);

  res.json(result);
});

/**
 * @swagger
 * /api/alerts/{id}/read:
 *   patch:
 *     summary: Mark a single alert as read
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: 'string' }
 *     responses:
 *       200:
 *         description: Alert updated
 */
router.patch('/:id/read', authenticate, (req, res) => {
  const alert = alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found.' });
  alert.isRead = true;
  res.json(alert);
});

/**
 * @swagger
 * /api/alerts/read-all:
 *   patch:
 *     summary: Bulk mark all alerts as read
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All alerts marked as read
 */
router.patch('/read-all', authenticate, (req, res) => {
  alerts.forEach(a => { a.isRead = true; });
  res.json({ message: 'All alerts marked as read.' });
});

module.exports = router;
