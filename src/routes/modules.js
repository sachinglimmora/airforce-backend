const router = require('express').Router();
const modulesController = require('../controllers/modulesController');
const { authenticate, authorize } = require('../middleware/auth');
const { upload, validateMagicBytes, handleUploadError } = require('../middleware/fileValidation');

/**
 * @swagger
 * tags:
 *   name: Modules
 *   description: Course modules and content management
 */

/**
 * @swagger
 * /api/modules:
 *   get:
 *     summary: List all modules
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of modules
 */
router.get('/', authenticate, modulesController.listModules);

/**
 * @swagger
 * /api/modules/{id}:
 *   get:
 *     summary: Get single module details
 *     tags: [Modules]
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
 *         description: Module details
 */
router.get('/:id', authenticate, modulesController.getModule);

/**
 * @swagger
 * /api/modules:
 *   post:
 *     summary: Create new module (Admin/Instructor only)
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Module created
 */
router.post('/', authenticate, authorize('admin', 'instructor'), modulesController.createModule);

/**
 * @swagger
 * /api/modules/{id}:
 *   patch:
 *     summary: Update module details
 *     tags: [Modules]
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
 *         description: Module updated
 */
router.patch('/:id', authenticate, authorize('admin', 'instructor'), modulesController.updateModule);

/**
 * @swagger
 * /api/modules/{id}/complete:
 *   post:
 *     summary: Mark module as completed
 *     tags: [Modules]
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
 *         description: Module marked as complete
 */
router.post('/:id/complete', authenticate, modulesController.completeModule);

/**
 * @swagger
 * /api/modules/{id}:
 *   delete:
 *     summary: Delete module (Admin/Instructor only)
 *     tags: [Modules]
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
 *         description: Module deleted
 */
router.delete('/:id', authenticate, authorize('admin', 'instructor'), modulesController.deleteModule);

router.post(
  '/:id/video/upload',
  authenticate,
  authorize('admin', 'instructor'),
  upload.single('video'),
  validateMagicBytes,
  handleUploadError,
  modulesController.uploadModuleVideo
);

router.post(
  '/:id/video/generate',
  authenticate,
  authorize('admin', 'instructor'),
  modulesController.generateModuleVideo
);

module.exports = router;
