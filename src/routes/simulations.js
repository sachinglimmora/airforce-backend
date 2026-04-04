const router = require('express').Router();
const simulationsController = require('../controllers/simulationsController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, simulationsController.listSimulations);
router.get('/:id', authenticate, simulationsController.getSimulation);
router.post('/:id/start', authenticate, simulationsController.startSimulation);
router.post('/:id/complete', authenticate, simulationsController.completeSimulation);
router.post('/', authenticate, authorize('instructor', 'admin'), simulationsController.createSimulation);
router.patch('/:id', authenticate, authorize('instructor', 'admin'), simulationsController.updateSimulation);
router.delete('/:id', authenticate, authorize('admin'), simulationsController.deleteSimulation);

module.exports = router;
