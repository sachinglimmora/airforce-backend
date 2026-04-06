const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../data/db');
const { users, roles, auditLogs, systemStatus, analyticsData } = db;
const { authenticate, authorize } = require('../middleware/auth');

const adminOnly = authorize('admin');

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
router.get('/dashboard', authenticate, adminOnly, (req, res) => {
  const totalTrainees = users.filter(u => u.role === 'trainee').length;
  const totalInstructors = users.filter(u => u.role === 'instructor').length;
  const unreadAlerts = auditLogs.filter(l => l.action === 'Login').length;

  res.json({
    totalUsers: users.length,
    totalTrainees,
    totalInstructors,
    recentAuditLogs: auditLogs.slice(0, 5),
    systemStatus,
    charts: analyticsData,
  });
});

// ─── Roles ────────────────────────────────────────────────────────────────────
router.get('/roles', authenticate, adminOnly, (req, res) => res.json(roles));

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

router.patch('/roles/:id', authenticate, adminOnly, (req, res) => {
  const role = roles.find(r => r.id === req.params.id);
  if (!role) return res.status(404).json({ error: 'Role not found.' });
  Object.assign(role, req.body);
  res.json(role);
});

router.delete('/roles/:id', authenticate, adminOnly, (req, res) => {
  const idx = roles.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Role not found.' });
  roles.splice(idx, 1);
  res.json({ message: 'Role deleted.' });
});

// ─── Audit Logs ───────────────────────────────────────────────────────────────
router.get('/audit-logs', authenticate, adminOnly, (req, res) => {
  const { module, userId, limit = 50, offset = 0 } = req.query;
  let logs = [...auditLogs];

  if (module) logs = logs.filter(l => l.module === module);
  if (userId) logs = logs.filter(l => l.userId === userId);

  const total = logs.length;
  logs = logs.slice(Number(offset), Number(offset) + Number(limit));

  res.json({ total, logs });
});

// ─── System Status ────────────────────────────────────────────────────────────
router.get('/system-status', authenticate, adminOnly, (req, res) => {
  // update lastChecked on each request
  systemStatus.forEach(s => { s.lastChecked = new Date().toISOString(); });
  res.json(systemStatus);
});

router.patch('/system-status/:service', authenticate, adminOnly, (req, res) => {
  const entry = systemStatus.find(s => s.service === decodeURIComponent(req.params.service));
  if (!entry) return res.status(404).json({ error: 'Service not found.' });
  Object.assign(entry, req.body, { lastChecked: new Date().toISOString() });
  res.json(entry);
});

// ─── Security Settings ────────────────────────────────────────────────────────
router.get('/security-settings', authenticate, adminOnly, (req, res) => res.json(db.securitySettings));

router.patch('/security-settings', authenticate, adminOnly, (req, res) => {
  Object.assign(db.securitySettings, req.body, { lastUpdated: new Date().toISOString() });
  res.json(db.securitySettings);
});

// ─── Users (Admin view) ───────────────────────────────────────────────────────
router.get('/users', authenticate, adminOnly, (req, res) => res.json(db.users));

// ─── Analytics ────────────────────────────────────────────────────────────────
router.get('/analytics', authenticate, adminOnly, (req, res) => {
  res.json(db.analyticsData);
});

module.exports = router;
