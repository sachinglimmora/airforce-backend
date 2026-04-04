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
  duration: { type: String },
  order: { type: Number },
  isCompleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Module', moduleSchema);
