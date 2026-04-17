const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const Course = require('../models/Course');

async function listCourses(req, res) {
  try {
    const { category, status, difficulty, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ title: regex }, { description: regex }];
    }

    const courses = await Course.find(status ? { ...query, status } : query);
    
    // Also fetch public instructor videos and map them to course format
    const InstructorVideo = require('../models/InstructorVideo');
    // Instructor videos don't have specialized 'status' in DB yet, but they appear as 'not-started'
    // So if user filters for not-started or no status, they see videos
    let videoQuery = { isPublic: true, ...query };
    const publicVideos = (status && status !== 'not-started') ? [] : await InstructorVideo.find(videoQuery);
    
    const mappedVideos = publicVideos.map(v => ({
      id: v.id,
      title: v.title,
      description: v.description,
      category: v.category,
      difficulty: v.difficulty || 'intermediate',
      thumbnail: `https://picsum.photos/400/250?random=${v.id}`,
      moduleCount: 1,
      completedModules: 0,
      progress: 0,
      status: 'not-started',
      duration: v.duration || '5 mins',
      isInstructorVideo: true
    }));

    const allItems = [
      ...courses.map(c => {
        const p = c.toObject();
        delete p._id; delete p.__v;
        return p;
      }),
      ...mappedVideos
    ];

    res.json(allItems);
  } catch (err) {
    console.error('listCourses error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getCategories(req, res) {
  try {
    const cats = await Course.distinct('category');
    res.json(cats);
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function getCourse(req, res) {
  try {
    let course = await Course.findOne({ id: req.params.id });
    
    if (!course) {
      // Check if it's an instructor video
      const InstructorVideo = require('../models/InstructorVideo');
      const video = await InstructorVideo.findOne({ id: req.params.id });
      
      if (video) {
        return res.json({
          id: video.id,
          title: video.title,
          description: video.description,
          category: video.category,
          difficulty: video.difficulty || 'intermediate',
          thumbnail: `https://picsum.photos/400/250?random=${video.id}`,
          moduleCount: 1,
          completedModules: 0,
          progress: 0,
          status: 'not-started',
          duration: video.duration || '5 mins',
          isInstructorVideo: true
        });
      }
      
      return res.status(404).json({ error: 'Course not found.' });
    }
    
    const p = course.toObject();
    delete p._id; delete p.__v;
    res.json(p);
  } catch(err) {
    console.error('getCourse error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function createCourse(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const courseData = {
      id: uuidv4(),
      ...req.body,
      moduleCount: 0,
      completedModules: 0,
      progress: 0,
      status: 'not-started',
      thumbnail: req.body.thumbnail || `https://picsum.photos/400/250?random=${Math.floor(Math.random() * 100)}`,
    };
    
    const course = await Course.create(courseData);
    
    const p = course.toObject();
    delete p._id; delete p.__v;
    res.status(201).json(p);
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function updateCourse(req, res) {
  try {
    const course = await Course.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    
    const p = course.toObject();
    delete p._id; delete p.__v;
    res.json(p);
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function deleteCourse(req, res) {
  try {
    const course = await Course.findOneAndDelete({ id: req.params.id });
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    res.json({ message: 'Course deleted.' });
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { listCourses, getCategories, getCourse, createCourse, updateCourse, deleteCourse };
