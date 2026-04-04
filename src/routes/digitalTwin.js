const router = require('express').Router();
const { aircraftSystems } = require('../data/db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/digital-twin — all aircraft systems
router.get('/', authenticate, (req, res) => {
  const { category, status } = req.query;
  let result = [...aircraftSystems];

  if (category) result = result.filter(s => s.category === category);
  if (status) result = result.filter(s => s.status === status);

  res.json(result);
});

// GET /api/digital-twin/:id
router.get('/:id', authenticate, (req, res) => {
  const system = aircraftSystems.find(s => s.id === req.params.id);
  if (!system) return res.status(404).json({ error: 'Aircraft system not found.' });
  res.json(system);
});

// GET /api/digital-twin/:id/components
router.get('/:id/components', authenticate, (req, res) => {
  const system = aircraftSystems.find(s => s.id === req.params.id);
  if (!system) return res.status(404).json({ error: 'Aircraft system not found.' });
  res.json(system.components);
});

// PATCH /api/digital-twin/:systemId/components/:componentId — instructor/admin update component status
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
