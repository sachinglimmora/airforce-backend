const router = require('express').Router();
const { body } = require('express-validator');
const coursesController = require('../controllers/coursesController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, coursesController.listCourses);
router.get('/categories', authenticate, coursesController.getCategories);
router.get('/:id', authenticate, coursesController.getCourse);
router.post('/', [
  authenticate,
  authorize('admin', 'instructor'),
  body('title').notEmpty().withMessage('Title is required')
], coursesController.createCourse);
router.patch('/:id', authenticate, authorize('admin', 'instructor'), coursesController.updateCourse);
router.delete('/:id', authenticate, authorize('admin'), coursesController.deleteCourse);

module.exports = router;
