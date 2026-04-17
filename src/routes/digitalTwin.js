const router = require('express').Router();
const { aircraftSystems: mockData } = require('../data/db');
const AircraftSystem = require('../models/AircraftSystem');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Digital Twin
 *   description: Real-time aircraft system monitoring and diagnostics
 */

// Helper to ensure database has some initial data for demo
async function ensureSeeded() {
  const count = await AircraftSystem.countDocuments();
  if (count === 0) {
    console.log('Seeding Aircraft Systems into MongoDB...');
    await AircraftSystem.insertMany(mockData);
  }
}

/**
 * @swagger
 * /api/digital-twin:
 *   get:
 *     summary: Get all aircraft systems status
 *     tags: [Digital Twin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of systems and their health
 */
router.get('/', authenticate, async (req, res) => {
  try {
    await ensureSeeded();
    const { category, status } = req.query;
    const query = {};

    if (category && category !== 'all') query.category = category;
    if (status) query.status = status;

    const result = await AircraftSystem.find(query).lean();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/digital-twin/{id}:
 *   get:
 *     summary: Get detailed status of a specific aircraft system
 *     tags: [Digital Twin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: System detailed data
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const system = await AircraftSystem.findOne({ id: req.params.id }).lean();
    if (!system) return res.status(404).json({ error: 'Aircraft system not found.' });
    res.json(system);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/digital-twin/{id}/components:
 *   get:
 *     summary: Get list of components for a system
 *     tags: [Digital Twin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of components
 */
router.get('/:id/components', authenticate, async (req, res) => {
  try {
    const system = await AircraftSystem.findOne({ id: req.params.id }).lean();
    if (!system) return res.status(404).json({ error: 'Aircraft system not found.' });
    res.json(system.components || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/digital-twin/{systemId}/components/{componentId}:
 *   patch:
 *     summary: Update component status (Instructor/Admin only)
 *     tags: [Digital Twin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: systemId
 *         required: true
 *         schema: type string
 *       - in: path
 *         name: componentId
 *         required: true
 *         schema: type string
 *     responses:
 *       200:
 *         description: Component updated and system health recomputed
 */
router.patch('/:systemId/components/:componentId', authenticate, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const system = await AircraftSystem.findOne({ id: req.params.systemId });
    if (!system) return res.status(404).json({ error: 'Aircraft system not found.' });

    const component = system.components.find(c => c.id === req.params.componentId);
    if (!component) return res.status(404).json({ error: 'Component not found.' });

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'id' && key !== '_id') {
        component[key] = req.body[key];
      }
    });

    // Recompute system health as average of component health values
    const avgHealth = Math.round(
      system.components.reduce((sum, c) => sum + c.health, 0) / system.components.length
    );
    system.health = avgHealth;

    const statuses = system.components.map(c => c.status);
    if (statuses.includes('faulty')) system.status = 'faulty';
    else if (statuses.includes('maintenance')) system.status = 'maintenance';
    else system.status = 'operational';

    await system.save();
    res.json({ system, component });
  } catch (err) {
    console.error('Update component error:', err);
    res.status(500).json({ error: 'Server error updating component' });
  }
});

module.exports = router;
