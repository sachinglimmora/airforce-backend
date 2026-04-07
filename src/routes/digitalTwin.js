const router = require('express').Router();
const { aircraftSystems } = require('../data/db');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Digital Twin
 *   description: Real-time aircraft system monitoring and diagnostics
 */

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
router.get('/', authenticate, (req, res) => {
  const { category, status } = req.query;
  let result = [...aircraftSystems];

  if (category) result = result.filter(s => s.category === category);
  if (status) result = result.filter(s => s.status === status);

  res.json(result);
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
router.get('/:id', authenticate, (req, res) => {
  const system = aircraftSystems.find(s => s.id === req.params.id);
  if (!system) return res.status(404).json({ error: 'Aircraft system not found.' });
  res.json(system);
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
router.get('/:id/components', authenticate, (req, res) => {
  const system = aircraftSystems.find(s => s.id === req.params.id);
  if (!system) return res.status(404).json({ error: 'Aircraft system not found.' });
  res.json(system.components);
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
router.patch('/:systemId/components/:componentId', authenticate, authorize('instructor', 'admin'), (req, res) => {
  const system = aircraftSystems.find(s => s.id === req.params.systemId);
  if (!system) return res.status(404).json({ error: 'Aircraft system not found.' });

  const component = system.components.find(c => c.id === req.params.componentId);
  if (!component) return res.status(404).json({ error: 'Component not found.' });

  Object.assign(component, req.body);

  // Recompute system health as average of component health values
  const avgHealth = Math.round(
    system.components.reduce((sum, c) => sum + c.health, 0) / system.components.length
  );
  system.health = avgHealth;

  const statuses = system.components.map(c => c.status);
  if (statuses.includes('faulty')) system.status = 'faulty';
  else if (statuses.includes('maintenance')) system.status = 'maintenance';
  else system.status = 'operational';

  res.json({ system, component });
});

module.exports = router;
