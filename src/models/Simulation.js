const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  type: { type: String },
  description: { type: String },
  duration: { type: String },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  category: { 
    type: String, 
    enum: [
      'Jet Engine Systems', 
      'Hydraulics', 
      'Electrical Systems', 
      'Avionics', 
      'Flight Control', 
      'Weapons Systems', 
      'Landing Gear', 
      'Fuel Systems',
      'Flight Ops'
    ],
    default: 'Flight Ops'
  },
  aircraft: { type: String },
  objectives: [{ type: String }],
  briefing: { type: String },
  status: { type: String, enum: ['available', 'in-progress', 'completed'], default: 'available' },
}, { timestamps: true });

module.exports = mongoose.model('Simulation', simulationSchema);
