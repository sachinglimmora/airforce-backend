const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  courseId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  documentation: { type: String },
  procedures: [{
    id: String,
    step: Number,
    title: String,
    description: String
  }],
  diagrams: [{
    id: String,
    title: String,
    imageUrl: String,
    description: String
  }],
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
      'General'
    ],
    default: 'General'
  },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  duration: { type: String },
  order: { type: Number },
  isCompleted: { type: Boolean, default: false },
  videoUrl: { type: String, default: null },
  videoStatus: { type: String, enum: ['none', 'processing', 'ready', 'error'], default: 'none' },
}, { timestamps: true });

module.exports = mongoose.model('Module', moduleSchema);
