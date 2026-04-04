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

    const courses = await Course.find(query);
    res.json(courses.map(c => {
      const p = c.toObject();
      delete p._id; delete p.__v;
      return p;
    }));
  } catch (err) {
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
    const course = await Course.findOne({ id: req.params.id });
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    
    const p = course.toObject();
    delete p._id; delete p.__v;
    res.json(p);
  } catch(err) {
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
