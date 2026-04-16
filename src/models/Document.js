const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['manual', 'procedure', 'diagram', 'technical-order', 'checklist', 'bulletin'],
    required: true 
  },
  aircraft: { 
    type: String,
    enum: ['su-30mki', 'mig-29', 'tejas', 'mi-17', 'chinook', 'lh-575', 'general'],
    default: 'general'
  },
  system: {
    type: String,
    enum: ['engine', 'hydraulics', 'electrical', 'avionics', 'flight-control', 'weapons', 'fuel', 'landing-gear', 'general'],
    default: 'general'
  },
  fileUrl: { type: String },
  fileType: { type: String, enum: ['pdf', 'doc', 'docx', 'txt', 'md', 'image'] },
  fileSize: { type: Number },
  content: { type: String },
  extractedText: { type: String },
  tags: [{ type: String }],
  uploadedBy: { type: String },
  isPublic: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0 },
  createdAt: { type: String },
  updatedAt: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
