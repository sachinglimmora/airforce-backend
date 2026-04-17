const router = require('express').Router();
const { traineeProgress } = require('../data/db');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Progress
 *   description: Trainee performance and progress tracking
 */

/**
 * @swagger
 * /api/progress:
 *   get:
 *     summary: Get training progress
 *     description: Trainees get their own progress. Instructors/Admins get all records.
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progress records retrieved
 */
router.get('/', authenticate, (req, res) => {
  if (req.user.role === 'trainee') {
    const progress = traineeProgress[req.user.id];
    if (!progress) {
      return res.json({
        userId: req.user.id,
        overallProgress: 0,
        readinessScore: 0,
        completedCourses: 0,
        totalCourses: 0,
        simulationHours: 0,
        completedModules: 0,
        skills: [
          { name: 'Technical Knowledge', level: 0, maxLevel: 5, category: 'Core' },
          { name: 'Practical Skills', level: 0, maxLevel: 5, category: 'Core' },
          { name: 'Emergency Procedures', level: 0, maxLevel: 5, category: 'Critical' },
          { name: 'Simulation Performance', level: 0, maxLevel: 5, category: 'Assessment' }
        ],
        recentActivity: []
      });
    }
    return res.json(progress);
  }

  // instructor or admin: return all
  res.json(Object.values(traineeProgress));
});

/**
 * @swagger
 * /api/progress/{traineeId}:
 *   get:
 *     summary: Get specific trainee's progress (Admin/Instructor only)
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: traineeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trainee progress record
 */
router.get('/:traineeId', authenticate, authorize('instructor', 'admin'), (req, res) => {
  const progress = traineeProgress[req.params.traineeId];
  if (!progress) return res.status(404).json({ error: 'Progress record not found.' });
  res.json(progress);
});

/**
 * @swagger
 * /api/progress/{traineeId}:
 *   patch:
 *     summary: Manually update trainee progress (Admin/Instructor only)
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: traineeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Progress record updated
 */
router.patch('/:traineeId', authenticate, authorize('instructor', 'admin'), (req, res) => {
  const id = req.params.traineeId;
  if (!traineeProgress[id]) {
    return res.status(404).json({ error: 'Progress record not found.' });
  }

  Object.assign(traineeProgress[id], req.body);
  res.json(traineeProgress[id]);
});

module.exports = router;
