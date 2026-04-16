const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');
const { generateWithAI } = require('../services/aiService');
const { upload, validateMagicBytes, handleUploadError } = require('../middleware/fileValidation');

const documents = [];

const categories = ['manual', 'procedure', 'diagram', 'technical-order', 'checklist', 'bulletin'];
const aircraftTypes = ['su-30mki', 'mig-29', 'tejas', 'mi-17', 'chinook', 'general'];
const systems = ['engine', 'hydraulics', 'electrical', 'avionics', 'flight-control', 'weapons', 'fuel', 'landing-gear', 'general'];
const fileTypes = ['pdf', 'doc', 'docx', 'txt', 'md', 'image'];

router.get('/', authenticate, (req, res) => {
  const { category, aircraft, system, search, sort } = req.query;
  
  let filtered = [...documents];
  
  if (category) filtered = filtered.filter(d => d.category === category);
  if (aircraft) filtered = filtered.filter(d => d.aircraft === aircraft);
  if (system) filtered = filtered.filter(d => d.system === system);
  
  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter(d => 
      d.title.toLowerCase().includes(query) ||
      d.description.toLowerCase().includes(query) ||
      d.tags.some(t => t.toLowerCase().includes(query))
    );
  }
  
  if (sort === 'views') filtered.sort((a, b) => b.viewCount - a.viewCount);
  else if (sort === 'recent') filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else if (sort === 'title') filtered.sort((a, b) => a.title.localeCompare(b.title));
  
  res.json({ 
    documents: filtered,
    total: filtered.length,
    categories,
    aircraft: aircraftTypes,
    systems,
  });
});

router.get('/categories', authenticate, (req, res) => {
  res.json({ categories, aircraft: aircraftTypes, systems });
});

router.get('/:id', authenticate, (req, res) => {
  const doc = documents.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  
  doc.viewCount++;
  res.json(doc);
});

router.post(
  '/',
  authenticate,
  upload.single('file'),
  validateMagicBytes,
  handleUploadError,
  (req, res) => {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only instructors and admins can upload documents' });
    }

    const file = req.file;
    const newDoc = {
      id: uuidv4(),
      title: req.body.title,
      description: req.body.description || '',
      category: req.body.category || 'manual',
      aircraft: req.body.aircraft || 'general',
      system: req.body.system || 'general',
      fileType: file ? file.mimetype : (req.body.fileType || 'pdf'),
      fileSize: file ? file.size : (req.body.fileSize || 0),
      originalName: file ? file.originalname : undefined,
      content: req.body.content || '',
      tags: req.body.tags || [],
      uploadedBy: req.user.name,
      isPublic: req.body.isPublic !== false,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    documents.unshift(newDoc);
    res.status(201).json(newDoc);
  }
);

router.post('/generate', authenticate, async (req, res) => {
  if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only instructors and admins can generate documents' });
  }
  
  const { title, category, aircraft, system, content } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  try {
    let generatedContent = content;
    
    if (!content) {
      const aircraftContext = aircraft === 'su-30mki' ? 'Su-30MKI fighter' : 
                             aircraft === 'mig-29' ? 'MiG-29 fighter' :
                             aircraft === 'tejas' ? 'Tejas LCA' : 'aircraft';
      const systemContext = system || 'general';
      
      const prompt = `Generate a detailed training document about: "${title}"

For ${aircraftContext}, focusing on ${systemContext} systems.

Structure:
1. Introduction & Purpose
2. System Overview
3. Technical Specifications
4. Operating Procedures
5. Safety Guidelines
6. Maintenance Notes

Use **bold** for critical values.
Include tables and lists where appropriate.
Be comprehensive and accurate.
Target 800-1200 words.`;

      generatedContent = await generateWithAI([{ role: 'user', content: prompt }]);
    }
    
    const newDoc = {
      id: uuidv4(),
      title,
      description: `AI-generated training document about ${title}`,
      category: category || 'manual',
      aircraft: aircraft || 'general',
      system: system || 'general',
      fileType: 'md',
      fileSize: generatedContent.length,
      content: generatedContent,
      tags: title.toLowerCase().split(' ').filter(t => t.length > 3).slice(0, 6),
      uploadedBy: req.user.name,
      isPublic: true,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    documents.unshift(newDoc);
    res.status(201).json(newDoc);
  } catch (error) {
    console.error('Document generation error:', error);
    res.status(500).json({ error: 'Failed to generate document', details: error.message });
  }
});

router.put('/:id', authenticate, (req, res) => {
  if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only instructors and admins can update documents' });
  }
  
  const index = documents.findIndex(d => d.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Document not found' });
  
  documents[index] = {
    ...documents[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  
  res.json(documents[index]);
});

router.delete('/:id', authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can delete documents' });
  }
  
  const index = documents.findIndex(d => d.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Document not found' });
  
  documents.splice(index, 1);
  res.json({ message: 'Document deleted successfully' });
});

module.exports = router;
