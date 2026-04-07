const router = require('express').Router();
const { analyticsData, traineeProgress, users, simulations } = require('../data/db');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Training performance data and trends
 */

/**
 * @swagger
 * /api/analytics:
 *   get:
 *     summary: Get overall platform analytics (Admin/Instructor only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Global training metrics
 */
router.get('/', authenticate, authorize('instructor', 'admin'), (req, res) => {
  const allProgress = Object.values(traineeProgress);
  const totalTrainees = users.filter(u => u.role === 'trainee').length;
  const avgReadiness = allProgress.length
    ? Math.round(allProgress.reduce((s, p) => s + p.readinessScore, 0) / allProgress.length)
    : 0;
  const totalSimHours = allProgress.reduce((s, p) => s + p.simulationHours, 0);
  const completedSims = simulations.filter(s => s.status === 'completed').length;

  res.json({
    summary: {
      totalTrainees,
      avgReadiness,
      totalSimHours: parseFloat(totalSimHours.toFixed(1)),
      completedSims,
      activeSessions: 3, // mock
      simulationsToday: 8, // mock
    },
    charts: analyticsData,
  });
});

/**
 * @swagger
 * /api/analytics/trainee:
 *   get:
 *     summary: Get self-analytics (Trainee only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Individual performance data
 */
router.get('/trainee', authenticate, (req, res) => {
  const progress = traineeProgress[req.user.id];
  if (!progress) return res.status(404).json({ error: 'No data found.' });

  res.json({
    readinessScore: progress.readinessScore,
    overallProgress: progress.overallProgress,
    simulationHours: progress.simulationHours,
    skills: progress.skills,
    recentActivity: progress.recentActivity.slice(0, 10),
  });
});

module.exports = router;
