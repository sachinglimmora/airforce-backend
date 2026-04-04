const router = require('express').Router();
const modulesController = require('../controllers/modulesController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, modulesController.listModules);
router.get('/:id', authenticate, modulesController.getModule);
router.post('/', authenticate, authorize('admin', 'instructor'), modulesController.createModule);
router.patch('/:id', authenticate, authorize('admin', 'instructor'), modulesController.updateModule);
router.post('/:id/complete', authenticate, modulesController.completeModule);
router.delete('/:id', authenticate, authorize('admin', 'instructor'), modulesController.deleteModule);

module.exports = router;
