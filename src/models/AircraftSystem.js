const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  partNumber: { type: String },
  description: { type: String },
  status: { type: String, enum: ['operational', 'maintenance', 'faulty'], default: 'operational' },
  health: { type: Number, min: 0, max: 100, default: 100 },
  lastMaintenance: { type: String },
  nextMaintenance: { type: String },
  specifications: { type: Map, of: String },
});

const aircraftSystemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ['operational', 'maintenance', 'faulty'], default: 'operational' },
  health: { type: Number, min: 0, max: 100, default: 100 },
  components: [componentSchema],
}, { timestamps: true });

module.exports = mongoose.model('AircraftSystem', aircraftSystemSchema);
