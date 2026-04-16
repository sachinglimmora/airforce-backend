const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');
const { generateWithAI } = require('../services/aiService');

const quizzes = [];
const quizAttempts = [];

const aircraftContexts = {
  'su-30mki': {
    name: 'Su-30MKI',
    engines: '2x AL-31FP turbofan with thrust vectoring',
    maxSpeed: 'Mach 2.0',
    weapons: 'R-77, R-73 missiles, Kh-29, FAB bombs',
    radar: 'N011M Bars PESA radar',
  },
  'mig-29': {
    name: 'MiG-29',
    engines: '2x RD-33 turbofan',
    maxSpeed: 'Mach 2.3',
    weapons: 'R-73, R-27 missiles',
    radar: 'N019ME radar',
  },
  'tejas': {
    name: 'Tejas (LCA)',
    engines: 'GE F404-GE-IN20 turbofan',
    maxSpeed: 'Mach 1.8',
    weapons: 'R-Darter, Python missiles, bombs',
    radar: 'EL/M-2032 radar',
  },
  'general': {
    name: 'General Aviation',
    engines: 'Various aircraft systems',
    maxSpeed: 'Various',
    weapons: 'Various',
    radar: 'Various',
  },
};

const systemContexts = {
  'engine': 'jet engine systems, turbine mechanics, fuel systems, thrust production',
  'hydraulics': 'hydraulic power, actuators, landing gear, flight control hydraulics',
  'electrical': 'power generation, distribution, batteries, emergency systems',
  'avionics': 'flight instruments, navigation, communication, radar, displays',
  'flight-control': 'fly-by-wire, control surfaces, stability, envelope protection',
  'weapons': 'air-to-air, air-to-ground, missiles, bombs, targeting systems',
  'fuel': 'fuel storage, transfer, management, refueling',
  'landing-gear': 'extension, retraction, brakes, steering',
  'general': 'general aircraft procedures, safety, operations',
};

router.get('/', authenticate, (req, res) => {
  const { aircraft, system, courseId } = req.query;
  
  let filtered = quizzes.map(q => ({
    id: q.id,
    title: q.title,
    description: q.description,
    aircraft: q.aircraft,
    system: q.system,
    courseId: q.courseId,
    timeLimit: q.timeLimit,
    passingScore: q.passingScore,
    questionCount: q.questions.length,
    createdBy: q.createdBy,
    generatedBy: q.generatedBy,
    createdAt: q.createdAt,
  }));
  
  if (aircraft) filtered = filtered.filter(q => q.aircraft === aircraft);
  if (system) filtered = filtered.filter(q => q.system === system);
  if (courseId) filtered = filtered.filter(q => q.courseId === courseId);
  
  const userAttempts = quizAttempts.filter(a => a.userId === req.user.id);
  const quizStats = filtered.map(q => {
    const attempts = userAttempts.filter(a => a.quizId === q.id);
    const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.percentage)) : null;
    const lastAttempt = attempts.length > 0 ? attempts[attempts.length - 1].completedAt : null;
    return { ...q, attempts: attempts.length, bestScore, lastAttempt };
  });
  
  res.json({ quizzes: quizStats, total: quizStats.length });
});

router.get('/:id', authenticate, (req, res) => {
  const quiz = quizzes.find(q => q.id === req.params.id);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  
  res.json({
    ...quiz,
    questions: quiz.questions.map(q => ({
      ...q,
      correctAnswer: undefined,
    })),
  });
});

router.post('/generate', authenticate, async (req, res) => {
  if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only instructors and admins can generate quizzes' });
  }
  
  const { topic, aircraft, system, questionCount, difficulty } = req.body;
  
  try {
    const aircraftContext = aircraftContexts[aircraft] || aircraftContexts.general;
    const systemContext = systemContexts[system] || systemContexts.general;
    
    const prompt = `Generate ${questionCount || 5} quiz questions about ${systemContext} for the ${aircraftContext.name} aircraft.
    
Return ONLY a valid JSON array with this exact structure (no markdown, no explanation):
[
  {
    "type": "multiple-choice",
    "question": "The question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option B",
    "explanation": "Brief explanation of the correct answer",
    "points": 10,
    "difficulty": "easy|medium|hard",
    "topic": "Specific topic name"
  }
]

Requirements:
- Mix of easy, medium, and hard questions
- Only multiple-choice format
- Accurate technical information
- Training-relevant content
- Return ONLY the JSON array`;

    const aiResponse = await generateWithAI([
      { role: 'user', content: prompt }
    ]);
    
    let questions;
    try {
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        questions = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return res.status(500).json({ error: 'Failed to generate questions', details: 'AI response format error' });
    }
    
    const processedQuestions = questions.map((q, i) => ({
      id: `gen_${uuidv4().slice(0, 8)}_${i}`,
      type: q.type || 'multiple-choice',
      question: q.question,
      options: q.options || ['A', 'B', 'C', 'D'],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      points: q.points || 10,
      difficulty: q.difficulty || 'medium',
      topic: q.topic || system || 'General',
    }));
    
    const newQuiz = {
      id: uuidv4(),
      title: `AI Quiz: ${system?.replace('-', ' ').toUpperCase() || 'Training'} - ${aircraft?.toUpperCase() || 'General'}`,
      description: `AI-generated quiz covering ${systemContext} for ${aircraftContext.name}.`,
      aircraft: aircraft || 'general',
      system: system || 'general',
      courseId: null,
      questions: processedQuestions,
      timeLimit: Math.max((processedQuestions.length * 2), 10),
      passingScore: 70,
      createdBy: req.user.name,
      generatedBy: 'ai',
      createdAt: new Date().toISOString(),
    };
    
    quizzes.push(newQuiz);
    res.status(201).json(newQuiz);
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: 'Failed to generate quiz', details: error.message });
  }
});

router.post('/:id/submit', authenticate, (req, res) => {
  const quiz = quizzes.find(q => q.id === req.params.id);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  
  const { answers } = req.body;
  let score = 0;
  let totalPoints = 0;
  
  const results = quiz.questions.map(question => {
    totalPoints += question.points;
    const userAnswer = answers[question.id];
    let isCorrect = false;
    
    if (question.type === 'fill-blank' && question.correctAnswer) {
      const correctAnswers = question.correctAnswer.split('|');
      isCorrect = correctAnswers.some(ans => userAnswer?.toLowerCase().includes(ans.toLowerCase()));
    } else {
      isCorrect = userAnswer === question.correctAnswer;
    }
    
    if (isCorrect) score += question.points;
    
    return {
      questionId: question.id,
      userAnswer: userAnswer || '',
      isCorrect,
      explanation: question.explanation,
      correctAnswer: question.correctAnswer,
    };
  });
  
  const percentage = Math.round((score / totalPoints) * 100);
  const attempt = {
    id: uuidv4(),
    quizId: quiz.id,
    quizTitle: quiz.title,
    userId: req.user.id,
    answers: results,
    score,
    percentage,
    passed: percentage >= quiz.passingScore,
    startedAt: req.body.startedAt || new Date().toISOString(),
    completedAt: new Date().toISOString(),
    timeTaken: req.body.timeTaken || 0,
  };
  
  quizAttempts.push(attempt);
  
  res.json({
    attemptId: attempt.id,
    score,
    percentage,
    passed: attempt.passed,
    passingScore: quiz.passingScore,
    results,
    timeTaken: attempt.timeTaken,
  });
});

router.get('/attempts/history', authenticate, (req, res) => {
  const attempts = quizAttempts.filter(a => a.userId === req.user.id);
  res.json({ attempts, total: attempts.length });
});

router.get('/attempts/:id', authenticate, (req, res) => {
  const attempt = quizAttempts.find(a => a.id === req.params.id && a.userId === req.user.id);
  if (!attempt) {
    return res.status(404).json({ error: 'Attempt not found' });
  }
  res.json(attempt);
});

module.exports = router;
