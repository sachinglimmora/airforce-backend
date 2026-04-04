const router = require('express').Router();
const { traineeProgress } = require('../data/db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/progress — own progress for trainee, all for instructor/admin
router.get('/', authenticate, (req, res) => {
  if (req.user.role === 'trainee') {
    const progress = traineeProgress[req.user.id];
    if (!progress) return res.status(404).json({ error: 'Progress not found.' });
    return res.json(progress);
  }

  // instructor or admin: return all
  res.json(Object.values(traineeProgress));
});

// GET /api/progress/:traineeId — instructor or admin
router.get('/:traineeId', authenticate, authorize('instructor', 'admin'), (req, res) => {
  const progress = traineeProgress[req.params.traineeId];
  if (!progress) return res.status(404).json({ error: 'Progress record not found.' });
  res.json(progress);
});

// PATCH /api/progress/:traineeId — admin or instructor can manually update
router.patch('/:traineeId', authenticate, authorize('instructor', 'admin'), (req, res) => {
  const id = req.params.traineeId;
  if (!traineeProgress[id]) {
    return res.status(404).json({ error: 'Progress record not found.' });
  }

  Object.assign(traineeProgress[id], req.body);
  res.json(traineeProgress[id]);
});

module.exports = router;
