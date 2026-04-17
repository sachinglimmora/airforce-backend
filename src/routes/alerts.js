const router = require('express').Router();
const Alert = require('../models/Alert');
const { alerts: mockAlerts } = require('../data/db');
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
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, unread } = req.query;
    const User = require('../models/User'); // Import User model
    
    // Fetch the current user to check seeding status
    const user = await User.findOne({ id: req.user.id });

    // SEEDING: If this user hasn't been seeded yet, do it now
    if (user && !user.seededAlerts && unread !== 'true') {
      const initialAlerts = mockAlerts.map((ma, index) => ({
        id: `seed-${ma.id}-${req.user.id}-${index}`,
        userId: req.user.id,
        type: ma.type,
        title: ma.title,
        message: ma.message,
        timestamp: ma.timestamp,
        isRead: ma.isRead
      }));
      
      if (initialAlerts.length > 0) {
        await Alert.insertMany(initialAlerts);
      }
      
      // Mark as seeded in the DB
      user.seededAlerts = true;
      await user.save();
    }

    // Build query for MongoDB
    const query = { userId: req.user.id };
    if (type) query.type = type;
    if (unread === 'true') query.isRead = false;

    const mongoAlerts = await Alert.find(query).sort({ timestamp: -1 }).lean();
    res.json(mongoAlerts);
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ error: 'Server error' });
  }
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
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!alert) {
       return res.status(404).json({ error: 'Alert not found in database.' });
    }
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
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
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    await Alert.updateMany({ userId: req.user.id }, { isRead: true });
    res.json({ message: 'All alerts marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/alerts:
 *   delete:
 *     summary: Bulk delete all alerts for the user
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All alerts deleted
 */
router.delete('/', authenticate, async (req, res) => {
  try {
    // We explicitly target alerts belonging to this user
    const result = await Alert.deleteMany({ userId: req.user.id });
    res.json({ message: `Successfully cleared ${result.deletedCount} notifications from database.` });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
