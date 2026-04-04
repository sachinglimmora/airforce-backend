const mongoose = require('mongoose');

const traineeProgressSchema = new mongoose.Schema({
  traineeId: { type: String, required: true, unique: true },
  readinessScore: { type: Number, default: 0 },
  overallProgress: { type: Number, default: 0 },
  simulationHours: { type: Number, default: 0 },
  completedModules: { type: Number, default: 0 },
  totalModules: { type: Number, default: 0 },
  skills: {
    SituationalAwareness: { type: Number, default: 0 },
    EmergencyResponse: { type: Number, default: 0 },
    SystemsKnowledge: { type: Number, default: 0 },
    TacticalExecution: { type: Number, default: 0 }
  },
  recentActivity: [{
    id: { type: String },
    type: { type: String },
    title: { type: String },
    timestamp: { type: Date, default: Date.now },
    details: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('TraineeProgress', traineeProgressSchema);
