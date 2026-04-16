const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // keeping id for backward compatibility with existing mock IDs or uuidv4
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['trainee', 'instructor', 'admin'], default: 'trainee' },
  rank: { type: String },
  squadron: { type: String },
  base: { type: String },
  avatar: { type: String },
  joinedAt: { type: String },
  lastActive: { type: String },
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String, select: false }, // excluded from query results by default
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
