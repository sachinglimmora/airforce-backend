const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { users, traineeProgress, trainingSessions, scenarios, analyticsData } = require('../data/db');
const { authenticate, authorize } = require('../middleware/auth');

const instructorOnly = authorize('instructor', 'admin');

// GET /api/instructor/trainees — list all trainees with overview stats
router.get('/trainees', authenticate, instructorOnly, (req, res) => {
  const trainees = users
    .filter(u => u.role === 'trainee')
    .map(u => {
      const { passwordHash, ...user } = u;
      const progress = traineeProgress[u.id];
      return {
        ...user,
        readinessScore: progress?.readinessScore ?? 0,
        progress: progress?.overallProgress ?? 0,
        simulationHours: progress?.simulationHours ?? 0,
        status: 'active', // could be derived from lastActive
      };
    });

  res.json(trainees);
});

// GET /api/instructor/sessions
router.get('/sessions', authenticate, instructorOnly, (req, res) => {
  const userId = req.user.id;
  const myRole = req.user.role;

  let sessions = [...trainingSessions];
  if (myRole === 'instructor') {
    sessions = sessions.filter(s => s.instructorId === userId);
  }

  res.json(sessions);
});

// POST /api/instructor/sessions
router.post('/sessions', authenticate, instructorOnly, (req, res) => {
  const { title, date, duration, participants, type } = req.body;

  if (!title || !date) {
    return res.status(400).json({ error: 'title and date are required.' });
  }

  const session = {
    id: uuidv4(),
    title,
    instructorId: req.user.id,
    date,
    duration: duration || '1 hour',
    participants: participants || [],
    type: type || 'classroom',
    status: 'scheduled',
  };

  trainingSessions.push(session);
  res.status(201).json(session);
});

// PATCH /api/instructor/sessions/:id
router.patch('/sessions/:id', authenticate, instructorOnly, (req, res) => {
  const session = trainingSessions.find(s => s.id === req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found.' });
  if (req.user.role === 'instructor' && session.instructorId !== req.user.id) {
    return res.status(403).json({ error: 'Cannot modify another instructor\'s session.' });
  }
  Object.assign(session, req.body);
  res.json(session);
});

// DELETE /api/instructor/sessions/:id
router.delete('/sessions/:id', authenticate, instructorOnly, (req, res) => {
  const idx = trainingSessions.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Session not found.' });
  trainingSessions.splice(idx, 1);
  res.json({ message: 'Session deleted.' });
});

// GET /api/instructor/scenarios
router.get('/scenarios', authenticate, instructorOnly, (req, res) => {
  res.json(scenarios);
});

// POST /api/instructor/scenarios
router.post('/scenarios', authenticate, instructorOnly, (req, res) => {
  const { title, description, type, difficulty, parameters } = req.body;
  if (!title || !type) return res.status(400).json({ error: 'title and type required.' });

  const scenario = {
    id: uuidv4(),
    title,
    description: description || '',
    type,
    difficulty: difficulty || 'intermediate',
    parameters: parameters || {},
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
  };

  scenarios.push(scenario);
  res.status(201).json(scenario);
});

// GET /api/instructor/analytics
router.get('/analytics', authenticate, instructorOnly, (req, res) => {
  const totalTrainees = users.filter(u => u.role === 'trainee').length;
  const allProgress = Object.values(traineeProgress);
  const avgReadiness = allProgress.length
    ? Math.round(allProgress.reduce((s, p) => s + p.readinessScore, 0) / allProgress.length)
    : 0;
  const totalSimHours = allProgress.reduce((s, p) => s + p.simulationHours, 0);

  res.json({
    summary: { totalTrainees, avgReadiness, totalSimHours },
    charts: analyticsData,
  });
});

module.exports = router;
