const { v4: uuidv4 } = require('uuid');
const InstructorVideo = require('../models/InstructorVideo');
const User = require('../models/User');
const { uploadVideoBuffer, deleteVideo } = require('../services/cloudinaryService');

function formatDoc(doc) {
  const p = doc.toObject();
  delete p._id; delete p.__v;
  p.assignedTo = (p.assignedTo || []).map(a => {
    delete a._id;
    return a;
  });
  return p;
}

// GET /api/instructor-videos
// Returns all videos uploaded by the authenticated instructor
async function listVideos(req, res) {
  try {
    const videos = await InstructorVideo.find({ instructorId: req.user.id }).sort({ createdAt: -1 });
    res.json(videos.map(formatDoc));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

// POST /api/instructor-videos/upload   (multipart/form-data: video file + title + description + category + tags)
async function uploadVideo(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No video file provided.' });

    const { title, description, category, difficulty, isPublic, tags } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required.' });

    const id = uuidv4();
    const publicId = `instructor-videos/${req.user.id}/${id}`;
    const videoUrl = await uploadVideoBuffer(req.file.buffer, publicId);

    const video = await InstructorVideo.create({
      id,
      instructorId: req.user.id,
      title,
      description: description || '',
      videoUrl,
      cloudinaryPublicId: `instructor-videos/${req.user.id}/${id}`,
      category: category || 'General',
      difficulty: difficulty || 'intermediate',
      isPublic: isPublic === 'false' ? false : true,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });

    res.status(201).json(formatDoc(video));
  } catch (err) {
    console.error('instructorVideos uploadVideo error:', err);
    res.status(500).json({ error: 'Failed to upload video.' });
  }
}

// POST /api/instructor-videos/:id/assign   body: { traineeIds: ['id1', 'id2'] }
async function assignToTrainees(req, res) {
  try {
    const video = await InstructorVideo.findOne({ id: req.params.id, instructorId: req.user.id });
    if (!video) return res.status(404).json({ error: 'Video not found.' });

    const { traineeIds } = req.body;
    if (!Array.isArray(traineeIds) || traineeIds.length === 0) {
      return res.status(400).json({ error: 'traineeIds array is required.' });
    }

    // Fetch trainee names for display
    const trainees = await User.find({ id: { $in: traineeIds }, role: 'trainee' });
    const traineeMap = Object.fromEntries(trainees.map(t => [t.id, t.name]));

    const newAssignments = traineeIds
      .filter(tid => !video.assignedTo.some(a => a.traineeId === tid))
      .map(tid => ({ traineeId: tid, traineeName: traineeMap[tid] || tid, assignedAt: new Date() }));

    video.assignedTo.push(...newAssignments);
    await video.save();

    const Alert = require('../models/Alert');
    const alertData = newAssignments.map(assignment => ({
      id: uuidv4(),
      userId: assignment.traineeId,
      type: 'info',
      title: 'New Video Assignment',
      message: `Your instructor has assigned a new video: "${video.title}"`,
      timestamp: new Date().toISOString(),
      isRead: false
    }));

    if (alertData.length > 0) {
      await Alert.insertMany(alertData);
    }

    res.json({ message: `Assigned to ${newAssignments.length} trainee(s).`, video: formatDoc(video) });
  } catch (err) {
    console.error('instructorVideos assign error:', err);
    res.status(500).json({ error: 'Failed to assign video.' });
  }
}

// DELETE /api/instructor-videos/:id/assign/:traineeId  — remove one trainee from assignment
async function unassignTrainee(req, res) {
  try {
    const video = await InstructorVideo.findOne({ id: req.params.id, instructorId: req.user.id });
    if (!video) return res.status(404).json({ error: 'Video not found.' });

    video.assignedTo = video.assignedTo.filter(a => a.traineeId !== req.params.traineeId);
    await video.save();
    res.json({ message: 'Trainee unassigned.', video: formatDoc(video) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

// DELETE /api/instructor-videos/:id
async function deleteInstructorVideo(req, res) {
  try {
    const video = await InstructorVideo.findOne({ id: req.params.id, instructorId: req.user.id });
    if (!video) return res.status(404).json({ error: 'Video not found.' });

    await deleteVideo(video.cloudinaryPublicId);
    await InstructorVideo.deleteOne({ id: req.params.id });
    res.json({ message: 'Video deleted.' });
  } catch (err) {
    console.error('instructorVideos delete error:', err);
    res.status(500).json({ error: 'Failed to delete video.' });
  }
}

// GET /api/instructor-videos/trainee/:traineeId
// Returns videos assigned to a specific trainee by this instructor
async function getTraineeVideos(req, res) {
  try {
    const videos = await InstructorVideo.find({
      instructorId: req.user.id,
      'assignedTo.traineeId': req.params.traineeId,
    });
    res.json(videos.map(formatDoc));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

// GET /api/instructor-videos/my-assignments
async function getMyAssignedVideos(req, res) {
  try {
    const videos = await InstructorVideo.find({
      'assignedTo.traineeId': req.user.id
    });
    res.json(videos.map(formatDoc));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { listVideos, uploadVideo, assignToTrainees, unassignTrainee, deleteInstructorVideo, getTraineeVideos, getMyAssignedVideos };
