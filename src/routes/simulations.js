const router = require('express').Router();
const simulationsController = require('../controllers/simulationsController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Simulations
 *   description: Virtual training and simulation engine
 */

/**
 * @swagger
 * /api/simulations:
 *   get:
 *     summary: List all simulation scenarios
 *     tags: [Simulations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of simulations
 */
router.get('/', authenticate, simulationsController.listSimulations);

/**
 * @swagger
 * /api/simulations/{id}:
 *   get:
 *     summary: Get simulation scenario details
 *     tags: [Simulations]
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
 *         description: Simulation details
 */
router.get('/:id', authenticate, simulationsController.getSimulation);

/**
 * @swagger
 * /api/simulations/{id}/start:
 *   post:
 *     summary: Log the start of a simulation session
 *     tags: [Simulations]
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
 *         description: Simulation session started
 */
router.post('/:id/start', authenticate, simulationsController.startSimulation);

/**
 * @swagger
 * /api/simulations/{id}/complete:
 *   post:
 *     summary: Submit final score and complete simulation
 *     tags: [Simulations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score: { type: 'number' }
 *               timeSpent: { type: 'number' }
 *               metrics: { type: 'object' }
 *     responses:
 *       200:
 *         description: Simulation completed and score recorded
 */
router.post('/:id/complete', authenticate, simulationsController.completeSimulation);

/**
 * @swagger
 * /api/simulations:
 *   post:
 *     summary: Create new simulation config (Admin/Instructor only)
 *     tags: [Simulations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Simulation created
 */
router.post('/', authenticate, authorize('instructor', 'admin'), simulationsController.createSimulation);

/**
 * @swagger
 * /api/simulations/{id}:
 *   patch:
 *     summary: Update simulation configuration
 *     tags: [Simulations]
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
 *         description: Simulation updated
 */
router.patch('/:id', authenticate, authorize('instructor', 'admin'), simulationsController.updateSimulation);

/**
 * @swagger
 * /api/simulations/{id}:
 *   delete:
 *     summary: Delete simulation scenario (Admin only)
 *     tags: [Simulations]
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
 *         description: Simulation deleted
 */
router.delete('/:id', authenticate, authorize('admin'), simulationsController.deleteSimulation);

module.exports = router;
