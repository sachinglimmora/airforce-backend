const { v4: uuidv4 } = require('uuid');
const Module = require('../models/Module');
const Course = require('../models/Course');
const TraineeProgress = require('../models/TraineeProgress');
const InstructorVideo = require('../models/InstructorVideo');
const { uploadVideoBuffer } = require('../services/cloudinaryService');
const { generateAndUploadVideo } = require('../services/videoGenerationService');

function formatDoc(doc) {
  const p = doc.toObject();
  delete p._id; delete p.__v;
  return p;
}

async function listModules(req, res) {
  try {
    const { courseId } = req.query;
    if (!courseId) {
      const allModules = await Module.find().sort({ order: 1 });
      return res.json(allModules.map(formatDoc));
    }
    
    let modules = await Module.find({ courseId }).sort({ order: 1 });
    
    if (modules.length === 0) {
      // Check if this "courseId" is actually an Instructor Video ID
      const video = await InstructorVideo.findOne({ id: courseId });
      if (video) {
        // Return a virtual module for this video
        return res.json([{
          id: video.id,
          courseId: video.id,
          title: video.title,
          description: video.description,
          videoUrl: video.videoUrl,
          videoStatus: 'ready',
          documentation: video.description,
          procedures: [],
          diagrams: [],
          duration: video.duration || '5 mins',
          order: 1,
          isCompleted: false
        }]);
      }
    }
    
    res.json(modules.map(formatDoc));
  } catch(err) {
    console.error('listModules error:', err);
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
    // Strip video fields — those are only writable via dedicated video routes
    const { videoUrl: _v, videoStatus: _vs, ...safeBody } = req.body;
    const mod = await Module.findOneAndUpdate({ id: req.params.id }, safeBody, { new: true });
    if (!mod) return res.status(404).json({ error: 'Module not found.' });
    res.json(formatDoc(mod));
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function uploadModuleVideo(req, res) {
  try {
    const mod = await Module.findOne({ id: req.params.id });
    if (!mod) return res.status(404).json({ error: 'Module not found.' });

    if (!req.file) return res.status(400).json({ error: 'No video file provided.' });

    const instructorId = req.user.id;
    const publicId = `module-${mod.id}`;
    const secureUrl = await uploadVideoBuffer(req.file.buffer, publicId);

    mod.videoUrl = secureUrl;
    mod.videoStatus = 'ready';
    await mod.save();

    // Upsert into instructor library
    await InstructorVideo.findOneAndUpdate(
      { cloudinaryPublicId: publicId },
      {
        $setOnInsert: { id: uuidv4() },
        instructorId,
        title: mod.title,
        description: mod.description || '',
        videoUrl: secureUrl,
        cloudinaryPublicId: publicId,
        category: 'Module Video',
      },
      { upsert: true, new: true }
    );

    res.json({ message: 'Video uploaded successfully.', videoUrl: secureUrl, module: formatDoc(mod) });
  } catch (err) {
    console.error('Video upload error:', err);
    res.status(500).json({ error: 'Failed to upload video.' });
  }
}

async function generateModuleVideo(req, res) {
  try {
    const mod = await Module.findOne({ id: req.params.id });
    if (!mod) return res.status(404).json({ error: 'Module not found.' });

    const instructorId = req.user.id;
    const publicId = `module-${mod.id}`;

    mod.videoStatus = 'processing';
    await mod.save();

    res.json({ message: 'Video generation started.', videoStatus: 'processing', moduleId: mod.id });

    generateAndUploadVideo({
      moduleId: mod.id,
      title: mod.title,
      description: mod.description,
      documentation: mod.documentation,
    })
      .then(async (secureUrl) => {
        await Module.findOneAndUpdate({ id: mod.id }, { videoUrl: secureUrl, videoStatus: 'ready' });
        // Upsert into instructor library
        await InstructorVideo.findOneAndUpdate(
          { cloudinaryPublicId: publicId },
          {
            $setOnInsert: { id: uuidv4() },
            instructorId,
            title: mod.title,
            description: mod.description || '',
            videoUrl: secureUrl,
            cloudinaryPublicId: publicId,
            category: 'Module Video',
          },
          { upsert: true, new: true }
        );
        console.log(`[VideoGen] Saved module-${mod.id} to instructor library`);
      })
      .catch(async (err) => {
        console.error('Background video generation failed:', err);
        await Module.findOneAndUpdate({ id: mod.id }, { videoStatus: 'error' });
      });
  } catch (err) {
    console.error('generateModuleVideo error:', err);
    res.status(500).json({ error: 'Failed to start video generation.' });
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

module.exports = { listModules, getModule, createModule, updateModule, completeModule, deleteModule, uploadModuleVideo, generateModuleVideo };
