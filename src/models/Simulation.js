const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  type: { type: String },
  description: { type: String },
  duration: { type: String },
  difficulty: { type: String },
  aircraft: { type: String },
  objectives: [{ type: String }],
  briefing: { type: String },
  status: { type: String, enum: ['available', 'in-progress', 'completed'], default: 'available' },
}, { timestamps: true });

module.exports = mongoose.model('Simulation', simulationSchema);
