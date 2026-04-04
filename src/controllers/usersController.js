const bcrypt = require('bcryptjs');
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

async function listUsers(req, res) {
  try {
    const { role, search } = req.query;
    let query = {};
    
    if (role) query.role = role;
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { email: regex }, { rank: regex }];
    }
    
    const users = await User.find(query);
    res.json(users.map(safeUser));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function getUser(req, res) {
  try {
    const { id } = req.params;
    if (req.user.role === 'trainee' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    const user = await User.findOne({ id });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(safeUser(user));
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function createUser(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, role, password, rank, squadron, base } = req.body;

    const existingUser = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    const newUser = await User.create({
      id: uuidv4(),
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role,
      rank: rank || '',
      squadron: squadron || '',
      base: base || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`,
      joinedAt: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString(),
    });

    await AuditLog.create({
      id: uuidv4(),
      userId: req.user.id,
      userName: req.user.name,
      action: 'User Created',
      module: 'Admin',
      details: `Created new user: ${name} (${role})`,
      ipAddress: req.ip,
    });

    res.status(201).json(safeUser(newUser));
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const user = await User.findOne({ id });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const { name, rank, squadron, base, avatar } = req.body;
    if (name) user.name = name;
    if (rank !== undefined) user.rank = rank;
    if (squadron !== undefined) user.squadron = squadron;
    if (base !== undefined) user.base = base;
    if (avatar !== undefined) user.avatar = avatar;

    if (req.body.role && req.user.role === 'admin') {
      if (!['trainee', 'instructor', 'admin'].includes(req.body.role)) {
        return res.status(400).json({ error: 'Invalid role.' });
      }
      user.role = req.body.role;
    }

    await user.save();
    res.json(safeUser(user));
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (id === req.user.id) return res.status(400).json({ error: 'Cannot delete your own account.' });

    const user = await User.findOneAndDelete({ id });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    await AuditLog.create({
      id: uuidv4(),
      userId: req.user.id,
      userName: req.user.name,
      action: 'User Deleted',
      module: 'Admin',
      details: `Deleted user: ${user.name}`,
      ipAddress: req.ip,
    });

    res.json({ message: 'User deleted successfully.' });
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };
