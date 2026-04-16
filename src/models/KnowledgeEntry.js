const mongoose = require('mongoose');

const knowledgeEntrySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String },
  category: { type: String },
  aircraft: { type: String },
  system: { type: String },
  tags: [{ type: String }],
  relatedDocuments: [{ type: String }],
  relatedModules: [{ type: String }],
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  author: { type: String },
  source: { type: String },
  lastUpdated: { type: String },
  createdAt: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('KnowledgeEntry', knowledgeEntrySchema);
