const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');
const { generateWithAI } = require('../services/aiService');

const knowledgeEntries = [];
const quizAttempts = [];

const systemContexts = {
  'engine': 'jet engine systems, turbine mechanics, compressor, combustion, thrust vectoring',
  'hydraulics': 'hydraulic power, actuators, reservoirs, pumps, flight control hydraulics',
  'electrical': 'power generation, generators, batteries, distribution, emergency systems',
  'avionics': 'radar (N011M Bars), flight instruments, navigation, communication, displays',
  'flight-control': 'fly-by-wire, control surfaces, stability augmentation, envelope protection',
  'weapons': 'air-to-air missiles (R-77, R-73), air-to-ground weapons, targeting, fire control',
  'fuel': 'fuel storage, tanks, transfer pumps, fuel management computers, refueling',
  'landing-gear': 'extension, retraction, brakes, steering, emergency systems',
  'general': 'pre-flight inspection, emergency procedures, general aircraft operations',
};

router.get('/', authenticate, (req, res) => {
  const { search, aircraft, system, category, difficulty } = req.query;
  
  let filtered = [...knowledgeEntries];
  
  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter(entry => 
      entry.title.toLowerCase().includes(query) ||
      entry.content.toLowerCase().includes(query) ||
      entry.summary.toLowerCase().includes(query) ||
      entry.tags.some(t => t.toLowerCase().includes(query))
    );
  }
  
  if (aircraft) filtered = filtered.filter(entry => entry.aircraft === aircraft);
  if (system) filtered = filtered.filter(entry => entry.system === system);
  if (category) filtered = filtered.filter(entry => entry.category === category);
  if (difficulty) filtered = filtered.filter(entry => entry.difficulty === difficulty);
  
  const searchResults = filtered.map(entry => ({
    id: entry.id,
    title: entry.title,
    summary: entry.summary,
    category: entry.category,
    aircraft: entry.aircraft,
    system: entry.system,
    difficulty: entry.difficulty,
    tags: entry.tags,
    lastUpdated: entry.lastUpdated,
    matchedIn: search ? 
      (entry.title.toLowerCase().includes(search.toLowerCase()) ? 'title' : 
       entry.content.toLowerCase().includes(search.toLowerCase()) ? 'content' : 'tags') : 
      null,
  }));
  
  res.json({
    entries: searchResults,
    total: searchResults.length,
    categories: [...new Set(knowledgeEntries.map(e => e.category))],
    systems: [...new Set(knowledgeEntries.map(e => e.system))],
  });
});

router.get('/:id', authenticate, (req, res) => {
  const entry = knowledgeEntries.find(e => e.id === req.params.id);
  if (!entry) {
    return res.status(404).json({ error: 'Knowledge entry not found' });
  }
  
  const related = knowledgeEntries
    .filter(e => e.id !== entry.id && (
      e.system === entry.system ||
      e.aircraft === entry.aircraft ||
      e.tags.some(t => entry.tags.includes(t))
    ))
    .slice(0, 3)
    .map(e => ({ id: e.id, title: e.title, system: e.system }));
  
  res.json({ ...entry, related });
});

router.post('/search', authenticate, async (req, res) => {
  const { query, aircraft, system } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  
  try {
    const aircraftName = aircraft ? (aircraft === 'su-30mki' ? 'Su-30MKI' : aircraft === 'mig-29' ? 'MiG-29' : aircraft === 'tejas' ? 'Tejas LCA' : 'General') : 'Air Force aircraft';
    const systemContext = system ? systemContexts[system] || 'aircraft systems' : 'aircraft systems';
    
    const prompt = `User is asking about: "${query}"
    
Provide a comprehensive, accurate response about this topic for ${aircraftName} training.
Include:
1. Key concepts and terminology
2. Technical specifications where applicable
3. Operational procedures if relevant
4. Safety considerations

Format the response with **bold** for key terms and numbers.
Keep it educational and training-focused.
Maximum 500 words.`;

    const aiResponse = await generateWithAI([
      { role: 'user', content: prompt }
    ]);
    
    const entry = {
      id: uuidv4(),
      title: query,
      content: aiResponse,
      summary: aiResponse.slice(0, 200) + (aiResponse.length > 200 ? '...' : ''),
      category: 'AI Generated',
      aircraft: aircraft || 'general',
      system: system || 'general',
      tags: query.toLowerCase().split(' ').filter(t => t.length > 3).slice(0, 5),
      difficulty: 'intermediate',
      author: 'AI Assistant',
      source: 'AI Knowledge Engine',
      lastUpdated: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    
    knowledgeEntries.unshift(entry);
    
    const contextMatches = [];
    const terms = query.toLowerCase().split(' ').filter(t => t.length > 3);
    terms.forEach(term => {
      const index = aiResponse.toLowerCase().indexOf(term);
      if (index !== -1) {
        const start = Math.max(0, index - 40);
        const end = Math.min(aiResponse.length, index + term.length + 40);
        contextMatches.push('...' + aiResponse.slice(start, end) + '...');
      }
    });
    
    res.json({
      results: [{
        entry: {
          id: entry.id,
          title: entry.title,
          summary: entry.summary,
          category: entry.category,
          aircraft: entry.aircraft,
          system: entry.system,
          difficulty: entry.difficulty,
          tags: entry.tags,
          lastUpdated: entry.lastUpdated,
        },
        score: 100,
        contextMatches: contextMatches.slice(0, 3),
        isAIGenerated: true,
      }],
      total: 1,
      query,
      searchTime: Date.now(),
    });
  } catch (error) {
    console.error('Knowledge search error:', error);
    
    const scoredResults = knowledgeEntries.map(entry => {
      let score = 0;
      const queryLower = query.toLowerCase();
      const titleLower = entry.title.toLowerCase();
      const contentLower = entry.content.toLowerCase();
      const tagsLower = entry.tags.map(t => t.toLowerCase());
      
      const searchTerms = queryLower.split(' ').filter(t => t.length > 2);
      searchTerms.forEach(term => {
        if (titleLower.includes(term)) score += 10;
        if (contentLower.includes(term)) score += 3;
        if (tagsLower.some(t => t.includes(term))) score += 5;
      });
      
      return { entry, score };
    }).filter(r => r.score > 0).sort((a, b) => b.score - a.score);
    
    res.json({
      results: scoredResults.slice(0, 10).map(r => ({
        entry: {
          id: r.entry.id,
          title: r.entry.title,
          summary: r.entry.summary,
          category: r.entry.category,
          aircraft: r.entry.aircraft,
          system: r.entry.system,
          difficulty: r.entry.difficulty,
          tags: r.entry.tags,
          lastUpdated: r.entry.lastUpdated,
        },
        score: r.score,
        contextMatches: [],
        isAIGenerated: false,
      })),
      total: scoredResults.length,
      query,
      searchTime: Date.now(),
      fallback: true,
    });
  }
});

router.post('/generate', authenticate, async (req, res) => {
  if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only instructors and admins can generate knowledge entries' });
  }
  
  const { topic, aircraft, system, category } = req.body;
  
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }
  
  try {
    const aircraftContext = aircraft === 'su-30mki' ? 'Su-30MKI fighter aircraft' : 
                           aircraft === 'mig-29' ? 'MiG-29 fighter aircraft' :
                           aircraft === 'tejas' ? 'Tejas LCA aircraft' : 'general aircraft';
    const systemContext = system ? systemContexts[system] : 'aircraft systems';
    
    const prompt = `Create a detailed training article about: "${topic}"

This should be for ${aircraftContext}, focusing on ${systemContext}.

Structure your response with:
## Title
## Overview
## Key Components/Sections
## Technical Details (with specific values)
## Procedures (if applicable)
## Safety Considerations
## Common Issues/Troubleshooting

Use **bold** for critical values and warnings.
Format with numbered lists and bullet points.
Make it comprehensive and training-focused.
Include accurate technical specifications.`;

    const aiResponse = await generateWithAI([
      { role: 'user', content: prompt }
    ]);
    
    const entry = {
      id: uuidv4(),
      title: topic,
      content: aiResponse,
      summary: aiResponse.slice(0, 200) + (aiResponse.length > 200 ? '...' : ''),
      category: category || 'Technical Reference',
      aircraft: aircraft || 'general',
      system: system || 'general',
      tags: topic.toLowerCase().split(' ').filter(t => t.length > 3).slice(0, 8),
      difficulty: 'intermediate',
      author: req.user.name,
      source: 'AI Knowledge Engine',
      lastUpdated: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    
    knowledgeEntries.unshift(entry);
    res.status(201).json(entry);
  } catch (error) {
    console.error('Knowledge generation error:', error);
    res.status(500).json({ error: 'Failed to generate knowledge entry', details: error.message });
  }
});

module.exports = router;
