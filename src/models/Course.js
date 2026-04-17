const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
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
      'Fuel Systems'
    ],
    required: true
  },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  thumbnail: { type: String },
  moduleCount: { type: Number, default: 0 },
  completedModules: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  status: { type: String, enum: ['not-started', 'in-progress', 'completed'], default: 'not-started' },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
