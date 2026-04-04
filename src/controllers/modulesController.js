const { v4: uuidv4 } = require('uuid');
const Module = require('../models/Module');
const Course = require('../models/Course');
const TraineeProgress = require('../models/TraineeProgress');

function formatDoc(doc) {
  const p = doc.toObject();
  delete p._id; delete p.__v;
  return p;
}

async function listModules(req, res) {
  try {
    const { courseId } = req.query;
    let query = {};
    if (courseId) query.courseId = courseId;
    
    const modules = await Module.find(query).sort({ order: 1 });
    res.json(modules.map(formatDoc));
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function getModule(req, res) {
  try {
    const mod = await Module.findOne({ id: req.params.id });
    if (!mod) return res.status(404).json({ error: 'Module not found.' });
    res.json(formatDoc(mod));
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function createModule(req, res) {
  try {
    const { courseId, title, description, documentation, procedures, diagrams, duration, order } = req.body;

    if (!courseId || !title) {
      return res.status(400).json({ error: 'courseId and title are required.' });
    }

    const course = await Course.findOne({ id: courseId });
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    const totalModules = await Module.countDocuments({ courseId });

    const mod = await Module.create({
      id: uuidv4(),
      courseId,
      title,
      description: description || '',
      documentation: documentation || '',
      procedures: procedures || [],
      diagrams: diagrams || [],
      duration: duration || '30 min',
      order: order || totalModules + 1,
      isCompleted: false,
    });

    course.moduleCount = totalModules + 1;
    await course.save();

    res.status(201).json(formatDoc(mod));
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function updateModule(req, res) {
  try {
    const mod = await Module.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!mod) return res.status(404).json({ error: 'Module not found.' });
    res.json(formatDoc(mod));
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function completeModule(req, res) {
  try {
    const mod = await Module.findOne({ id: req.params.id });
    if (!mod) return res.status(404).json({ error: 'Module not found.' });

    mod.isCompleted = true;
    await mod.save();

    const userId = req.user.id;
    const progress = await TraineeProgress.findOne({ traineeId: userId });
    
    if (progress) {
      progress.completedModules = Math.min(progress.completedModules + 1, progress.totalModules);
      progress.overallProgress = Math.round((progress.completedModules / progress.totalModules) * 100);
      progress.recentActivity.unshift({
        id: uuidv4(),
        type: 'module-completed',
        title: mod.title,
        timestamp: new Date(),
      });
      await progress.save();
    }

    const courseModules = await Module.find({ courseId: mod.courseId });
    const completedCount = courseModules.filter(m => m.isCompleted).length;
    
    const course = await Course.findOne({ id: mod.courseId });
    if (course) {
      course.completedModules = completedCount;
      course.progress = Math.round((completedCount / courseModules.length) * 100) || 0;
      course.status = course.progress === 100 ? 'completed' : course.progress > 0 ? 'in-progress' : 'not-started';
      await course.save();
    }

    res.json({ message: 'Module marked as complete.', module: formatDoc(mod) });
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function deleteModule(req, res) {
  try {
    const mod = await Module.findOneAndDelete({ id: req.params.id });
    if (!mod) return res.status(404).json({ error: 'Module not found.' });
    
    const course = await Course.findOne({ id: mod.courseId });
    if (course) {
      course.moduleCount = await Module.countDocuments({ courseId: mod.courseId });
      await course.save();
    }
    
    res.json({ message: 'Module deleted.' });
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { listModules, getModule, createModule, updateModule, completeModule, deleteModule };
