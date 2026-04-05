const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

function safeUser(u) {
  const obj = u.toObject ? u.toObject() : u;
  delete obj.passwordHash;
  delete obj._id;
  delete obj.__v;
  return obj;
}

function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing. Please check your environment variables.');
  }
  return jwt.sign(
    { sub: user.id || user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    user.lastActive = new Date().toISOString();
    await user.save();

    const token = signToken(user);

    await AuditLog.create({
      id: uuidv4(),
      userId: user.id || user._id.toString(),
      userName: user.name || 'Unknown User',
      action: 'Login',
      module: 'Auth',
      details: `Successful login from ${req.ip}`,
      ipAddress: req.ip,
    });

    res.json({ token, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  try {
    await AuditLog.create({
      id: uuidv4(),
      userId: req.user.id,
      userName: req.user.name,
      action: 'Logout',
      module: 'Auth',
      details: 'User logged out',
      ipAddress: req.ip,
    });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error during logout' });
  }
}

async function getMe(req, res) {
  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(safeUser(user));
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function changePassword(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { currentPassword, newPassword } = req.body;
    const user = await User.findOne({ id: req.user.id });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, logout, getMe, changePassword };
