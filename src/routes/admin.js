const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../data/db');
const { roles, systemStatus, analyticsData } = db;
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { authenticate, authorize } = require('../middleware/auth');

const adminOnly = authorize('admin');

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Platform administration and monitoring
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get dashboard statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 */
router.get('/dashboard', authenticate, adminOnly, async (req, res) => {
  try {
    const totalTrainees = await User.countDocuments({ role: 'trainee' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const totalUsers = await User.countDocuments();
    const recentAuditLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(5).lean();
    const unreadAlerts = await AuditLog.countDocuments({ action: 'Login' }); // Match legacy mock logic

    res.json({
      totalUsers,
      totalTrainees,
      totalInstructors,
      recentAuditLogs,
      systemStatus,
      charts: analyticsData,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Roles ────────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/admin/roles:
 *   get:
 *     summary: List platform authorization roles
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 */
router.get('/roles', authenticate, adminOnly, (req, res) => res.json(roles));

/**
 * @swagger
 * /api/admin/roles:
 *   post:
 *     summary: Initialize a new authorization role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Role created
 */
router.post('/roles', authenticate, adminOnly, (req, res) => {
  const { name, permissions } = req.body;
  if (!name) return res.status(400).json({ error: 'Role name required.' });

  const role = {
    id: uuidv4(),
    name,
    permissions: permissions || [],
    userCount: 0,
    createdAt: new Date().toISOString().split('T')[0],
  };
  roles.push(role);
  res.status(201).json(role);
});

/**
 * @swagger
 * /api/admin/roles/{id}:
 *   patch:
 *     summary: Modify role permissions
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: 'string' }
 *     responses:
 *       200:
 *         description: Role updated
 */
router.patch('/roles/:id', authenticate, adminOnly, (req, res) => {
  const role = roles.find(r => r.id === req.params.id);
  if (!role) return res.status(404).json({ error: 'Role not found.' });
  Object.assign(role, req.body);
  res.json(role);
});

/**
 * @swagger
 * /api/admin/roles/{id}:
 *   delete:
 *     summary: Purge authorization role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: 'string' }
 *     responses:
 *       200:
 *         description: Role deleted
 */
router.delete('/roles/:id', authenticate, adminOnly, (req, res) => {
  const idx = roles.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Role not found.' });
  roles.splice(idx, 1);
  res.json({ message: 'Role deleted.' });
});

// ─── Audit Logs ───────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: Fetch platform audit logs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: module
 *         schema: { type: 'string' }
 *       - in: query
 *         name: userId
 *         schema: { type: 'string' }
 *     responses:
 *       200:
 *         description: List of audit records
 */
router.get('/audit-logs', authenticate, adminOnly, async (req, res) => {
  try {
    const { module, userId, limit = 50, offset = 0 } = req.query;
    let query = {};

    if (module) query.module = module;
    if (userId) query.userId = userId;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit))
      .lean();

    res.json({ total, logs });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── System Status ────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/admin/system-status:
 *   get:
 *     summary: Monitor infrastructure health
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health status
 */
router.get('/system-status', authenticate, adminOnly, (req, res) => {
  // update lastChecked on each request
  systemStatus.forEach(s => { s.lastChecked = new Date().toISOString(); });
  res.json(systemStatus);
});

/**
 * @swagger
 * /api/admin/system-status/{service}:
 *   patch:
 *     summary: Override service status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: service
 *         required: true
 *         schema: { type: 'string' }
 *     responses:
 *       200:
 *         description: Service status updated
 */
router.patch('/system-status/:service', authenticate, adminOnly, (req, res) => {
  const entry = systemStatus.find(s => s.service === decodeURIComponent(req.params.service));
  if (!entry) return res.status(404).json({ error: 'Service not found.' });
  Object.assign(entry, req.body, { lastChecked: new Date().toISOString() });
  res.json(entry);
});

// ─── Security Settings ────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/admin/security-settings:
 *   get:
 *     summary: Fetch security & MFA policies
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current security perimeter settings
 */
router.get('/security-settings', authenticate, adminOnly, (req, res) => res.json(db.securitySettings));

/**
 * @swagger
 * /api/admin/security-settings:
 *   patch:
 *     summary: Update global security perimeter
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings updated
 */
router.patch('/security-settings', authenticate, adminOnly, (req, res) => {
  Object.assign(db.securitySettings, req.body, { lastUpdated: new Date().toISOString() });
  res.json(db.securitySettings);
});

// ─── Users (Admin view) ───────────────────────────────────────────────────────
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Administrative user view
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users in system
 */
router.get('/users', authenticate, adminOnly, async (req, res) => {
  try {
    const allUsers = await User.find().lean();
    res.json(allUsers.map(u => {
      const { passwordHash, ...safeUser } = u;
      return safeUser;
    }));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Analytics ────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Aggregate training performance data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics overview
 */
router.get('/analytics', authenticate, adminOnly, (req, res) => {
  res.json(db.analyticsData);
});

module.exports = router;
