const router = require('express').Router();
const { analyticsData, traineeProgress, users, simulations } = require('../data/db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/analytics — full analytics data (instructor/admin)
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

// GET /api/analytics/trainee — trainee's own analytics (readiness, skill trends)
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
