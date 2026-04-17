const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { trainingSessions, scenarios, analyticsData } = require('../data/db');
const User = require('../models/User');
const TraineeProgress = require('../models/TraineeProgress');
const { authenticate, authorize } = require('../middleware/auth');

const instructorOnly = authorize('instructor', 'admin');

/**
 * @swagger
 * tags:
 *   name: Instructor
 *   description: Instructor tools for session management and trainee oversight
 */

/**
 * @swagger
 * /api/instructor/trainees:
 *   get:
 *     summary: List all trainees with readiness scores
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of trainees
 */
router.get('/trainees', authenticate, instructorOnly, async (req, res) => {
  try {
    console.log('Fetching trainees from MongoDB...');
    const trainees = await User.find({ role: 'trainee' }).lean();
    console.log(`Found ${trainees.length} trainees in DB.`);
    
    const results = await Promise.all(trainees.map(async (u) => {
      try {
        const progress = await TraineeProgress.findOne({ traineeId: u.id }).lean();
        return {
          id: u.id,
          name: u.name,
          rank: u.rank,
          email: u.email,
          squadron: u.squadron,
          base: u.base,
          avatar: u.avatar,
          lastActive: u.lastActive,
          readinessScore: progress?.readinessScore ?? 0,
          progress: progress?.overallProgress ?? 0,
          simulationHours: progress?.simulationHours ?? 0,
          status: 'active',
        };
      } catch (innerErr) {
        console.error(`Error fetching progress for trainee ${u.id}:`, innerErr);
        // Return user even without progress
        return {
          id: u.id,
          name: u.name,
          rank: u.rank,
          avatar: u.avatar,
          readinessScore: 0,
          progress: 0,
          simulationHours: 0,
          status: 'active',
        };
      }
    }));

    res.json(results);
  } catch (err) {
    console.error('CRITICAL: Error in /trainees route:', err);
    res.status(500).json({ error: 'Server error fetching trainees.' });
  }
});

/**
 * @swagger
 * /api/instructor/sessions:
 *   get:
 *     summary: Get scheduled training sessions
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sessions
 */
router.get('/sessions', authenticate, instructorOnly, (req, res) => {
  const userId = req.user.id;
  const myRole = req.user.role;

  let sessions = [...trainingSessions];
  if (myRole === 'instructor') {
    sessions = sessions.filter(s => s.instructorId === userId);
  }

  res.json(sessions);
});

/**
 * @swagger
 * /api/instructor/sessions:
 *   post:
 *     summary: Schedule a new training session
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Session scheduled
 */
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

/**
 * @swagger
 * /api/instructor/sessions/{id}:
 *   patch:
 *     summary: Update session details
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: 'string' }
 *     responses:
 *       200:
 *         description: Session updated
 */
router.patch('/sessions/:id', authenticate, instructorOnly, (req, res) => {
  const session = trainingSessions.find(s => s.id === req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found.' });
  if (req.user.role === 'instructor' && session.instructorId !== req.user.id) {
    return res.status(403).json({ error: 'Cannot modify another instructor\'s session.' });
  }
  Object.assign(session, req.body);
  res.json(session);
});

/**
 * @swagger
 * /api/instructor/sessions/{id}:
 *   delete:
 *     summary: Cancel training session
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: 'string' }
 *     responses:
 *       200:
 *         description: Session deleted
 */
router.delete('/sessions/:id', authenticate, instructorOnly, (req, res) => {
  const idx = trainingSessions.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Session not found.' });
  trainingSessions.splice(idx, 1);
  res.json({ message: 'Session deleted.' });
});

/**
 * @swagger
 * /api/instructor/scenarios:
 *   get:
 *     summary: List library of available scenarios
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Scenario library
 */
router.get('/scenarios', authenticate, instructorOnly, (req, res) => {
  res.json(scenarios);
});

/**
 * @swagger
 * /api/instructor/scenarios:
 *   post:
 *     summary: Create new training scenario
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Scenario created
 */
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

/**
 * @swagger
 * /api/instructor/analytics:
 *   get:
 *     summary: Instructor-level analytics overview
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Collective performance analytics
 */
router.get('/analytics', authenticate, instructorOnly, async (req, res) => {
  try {
    const totalTrainees = await User.countDocuments({ role: 'trainee' });
    const allProgress = await TraineeProgress.find().lean();
    
    const avgReadiness = allProgress.length
      ? Math.round(allProgress.reduce((s, p) => s + p.readinessScore, 0) / allProgress.length)
      : 0;
    const totalSimHours = allProgress.reduce((s, p) => s + p.simulationHours, 0);

    res.json({
      summary: { totalTrainees, avgReadiness, totalSimHours },
      charts: analyticsData,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
