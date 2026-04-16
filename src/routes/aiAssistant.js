const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { chatHistory } = require('../data/db');
const { authenticate } = require('../middleware/auth');
const { generateWithAI } = require('../services/aiService');

const conversationHistories = {};

router.get('/history', authenticate, (req, res) => {
  const history = conversationHistories[req.user.id] || chatHistory[req.user.id] || [];
  res.json(history);
});

router.post('/message', authenticate, async (req, res) => {
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  if (!conversationHistories[req.user.id]) {
    conversationHistories[req.user.id] = [
      {
        id: uuidv4(),
        role: 'assistant',
        content: 'Welcome to the Air Force Training Intelligence Platform. I am your AI training assistant. How can I help you today? I can answer questions about aircraft systems, procedures, maintenance, and more.',
        timestamp: new Date().toISOString(),
      },
    ];
  }

  const userMsg = {
    id: uuidv4(),
    role: 'user',
    content: content.trim(),
    timestamp: new Date().toISOString(),
  };
  conversationHistories[req.user.id].push(userMsg);

  try {
    const historyMessages = conversationHistories[req.user.id]
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content }));

    const responseContent = await generateWithAI(historyMessages);

    const assistantMsg = {
      id: uuidv4(),
      role: 'assistant',
      content: responseContent,
      timestamp: new Date().toISOString(),
    };
    conversationHistories[req.user.id].push(assistantMsg);

    res.json({
      userMessage: userMsg,
      assistantMessage: assistantMsg,
    });
  } catch (error) {
    console.error('AI Assistant error:', error);
    
    const fallbackMsg = {
      id: uuidv4(),
      role: 'assistant',
      content: `I apologize, but I'm having trouble generating a response right now. Please try again.

In the meantime, you can:
- Browse the **Training Catalog** for relevant courses
- Check the **Knowledge Base** for technical references
- Take a **Quiz** to test your knowledge

For immediate assistance, contact your instructor.`,
      timestamp: new Date().toISOString(),
      error: true,
    };
    conversationHistories[req.user.id].push(fallbackMsg);

    res.json({
      userMessage: userMsg,
      assistantMessage: fallbackMsg,
    });
  }
});

router.post('/explain', authenticate, async (req, res) => {
  const { topic, context } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    const prompt = context 
      ? `Explain "${topic}" in the context of: ${context}\n\nProvide a clear, educational explanation suitable for Air Force training.`
      : `Provide a detailed training explanation about: "${topic}"\n\nInclude:\n- Definition and purpose\n- Key components\n- Operational details\n- Safety considerations\n\nUse **bold** for key terms.`;

    const explanation = await generateWithAI([{ role: 'user', content: prompt }]);

    res.json({
      topic,
      explanation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Explanation error:', error);
    res.status(500).json({ error: 'Failed to generate explanation', details: error.message });
  }
});

router.post('/quiz', authenticate, async (req, res) => {
  const { topic, count = 5 } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    const prompt = `Generate ${count} training questions about: "${topic}"

Return ONLY a JSON array:
[
  {
    "question": "Question text?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "B",
    "explanation": "Why this is correct",
    "difficulty": "easy|medium|hard"
  }
]

Accurate technical content only.`;

    const aiResponse = await generateWithAI([{ role: 'user', content: prompt }]);
    
    let questions;
    try {
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      questions = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiResponse);
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    res.json({
      topic,
      questions: questions.map((q, i) => ({ ...q, id: uuidv4() })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: 'Failed to generate quiz questions' });
  }
});

router.delete('/history', authenticate, (req, res) => {
  conversationHistories[req.user.id] = [
    {
      id: uuidv4(),
      role: 'assistant',
      content: 'Welcome to the Air Force Training Intelligence Platform. I am your AI training assistant. How can I help you today?',
      timestamp: new Date().toISOString(),
    },
  ];
  res.json({ message: 'Chat history cleared.' });
});

module.exports = router;
