const router = require('express').Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const mfaController = require('../controllers/mfaController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and identity management
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to the platform
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: arjun.singh@iaf.gov.in
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], authController.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout from the platform
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password updated successfully
 */
router.post('/change-password', [
  authenticate,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], authController.changePassword);

// ── MFA Routes ────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/mfa/status:
 *   get:
 *     summary: Get MFA status for current user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: MFA status
 */
router.get('/mfa/status', authenticate, mfaController.getMfaStatus);

/**
 * @swagger
 * /api/auth/mfa/setup:
 *   post:
 *     summary: Initiate MFA setup — returns QR code and secret
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: QR code data URL and manual entry key
 */
router.post('/mfa/setup', authenticate, mfaController.setupMfa);

/**
 * @swagger
 * /api/auth/mfa/verify:
 *   post:
 *     summary: Confirm first TOTP token and enable MFA
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: MFA enabled
 */
router.post('/mfa/verify', [
  authenticate,
  body('token').isLength({ min: 6, max: 6 }).withMessage('TOTP token must be 6 digits'),
], mfaController.verifyMfa);

/**
 * @swagger
 * /api/auth/mfa/validate:
 *   post:
 *     summary: Validate TOTP token during login (second factor)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, token]
 *             properties:
 *               userId:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token valid
 *       401:
 *         description: Invalid token
 */
router.post('/mfa/validate', [
  body('userId').notEmpty().withMessage('userId is required'),
  body('token').isLength({ min: 6, max: 6 }).withMessage('TOTP token must be 6 digits'),
], mfaController.validateMfa);

/**
 * @swagger
 * /api/auth/mfa/disable:
 *   post:
 *     summary: Disable MFA (requires current TOTP token)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: MFA disabled
 */
router.post('/mfa/disable', [
  authenticate,
  body('token').isLength({ min: 6, max: 6 }).withMessage('TOTP token must be 6 digits'),
], mfaController.disableMfa);

module.exports = router;
