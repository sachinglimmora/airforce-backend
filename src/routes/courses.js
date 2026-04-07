const router = require('express').Router();
const { body } = require('express-validator');
const coursesController = require('../controllers/coursesController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Training courses and curriculum
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: List all courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of courses
 */
router.get('/', authenticate, coursesController.listCourses);

/**
 * @swagger
 * /api/courses/categories:
 *   get:
 *     summary: Get all course categories
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/categories', authenticate, coursesController.getCategories);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course details by ID
 *     tags: [Courses]
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
 *         description: Course details
 */
router.get('/:id', authenticate, coursesController.getCourse);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course (Admin/Instructor only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       201:
 *         description: Course created
 */
router.post('/', [
  authenticate,
  authorize('admin', 'instructor'),
  body('title').notEmpty().withMessage('Title is required')
], coursesController.createCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   patch:
 *     summary: Update course details
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       200:
 *         description: Course updated
 */
router.patch('/:id', authenticate, authorize('admin', 'instructor'), coursesController.updateCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete course (Admin only)
 *     tags: [Courses]
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
 *         description: Course deleted
 */
router.delete('/:id', authenticate, authorize('admin'), coursesController.deleteCourse);

module.exports = router;
