const mongoose = require('mongoose');

const instructorVideoSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  instructorId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  videoUrl: { type: String, required: true },
  cloudinaryPublicId: { type: String, required: true },
  duration: { type: String, default: '' },
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
  tags: [{ type: String }],
  assignedTo: [
    {
      traineeId: { type: String, required: true },
      traineeName: { type: String },
      assignedAt: { type: Date, default: Date.now },
    },
  ],
  isPublic: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('InstructorVideo', instructorVideoSchema);
