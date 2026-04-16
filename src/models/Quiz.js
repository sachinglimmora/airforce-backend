const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: String,
  type: { 
    type: String, 
    enum: ['multiple-choice', 'true-false', 'fill-blank', 'matching'],
    required: true 
  },
  question: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String },
  explanation: { type: String },
  points: { type: Number, default: 1 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  topic: { type: String },
});

const quizSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  courseId: { type: String },
  moduleId: { type: String },
  aircraft: { type: String },
  system: { type: String },
  questions: [questionSchema],
  timeLimit: { type: Number },
  passingScore: { type: Number, default: 70 },
  createdBy: { type: String },
  generatedBy: { type: String, enum: ['ai', 'manual', 'instructor'] },
  sourceDocumentId: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
}, { timestamps: true });

const quizAttemptSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  quizId: { type: String, required: true },
  userId: { type: String, required: true },
  answers: [{
    questionId: String,
    userAnswer: String,
    isCorrect: Boolean,
    timeSpent: Number,
  }],
  score: { type: Number },
  percentage: { type: Number },
  passed: { type: Boolean },
  startedAt: { type: String },
  completedAt: { type: String },
  timeTaken: { type: Number },
}, { timestamps: true });

module.exports = {
  Quiz: mongoose.model('Quiz', quizSchema),
  QuizAttempt: mongoose.model('QuizAttempt', quizAttemptSchema),
};
