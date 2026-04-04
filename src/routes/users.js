const router = require('express').Router();
const { body } = require('express-validator');
const usersController = require('../controllers/usersController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin', 'instructor'), usersController.listUsers);
router.get('/:id', authenticate, usersController.getUser);
router.post('/', [
  authenticate,
  authorize('admin'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['trainee', 'instructor', 'admin']).withMessage('Invalid role')
], usersController.createUser);
router.patch('/:id', authenticate, usersController.updateUser);
router.delete('/:id', authenticate, authorize('admin'), usersController.deleteUser);

module.exports = router;
