const router = require('express').Router();
const ctrl = require('../controllers/instructorVideosController');
const { authenticate, authorize } = require('../middleware/auth');
const { upload, validateMagicBytes, handleUploadError } = require('../middleware/fileValidation');

const instructorOrAdmin = authorize('admin', 'instructor');

// List all videos for the authenticated instructor
router.get('/', authenticate, instructorOrAdmin, ctrl.listVideos);

// Upload a new video
router.post(
  '/upload',
  authenticate,
  instructorOrAdmin,
  upload.single('video'),
  validateMagicBytes,
  handleUploadError,
  ctrl.uploadVideo
);
// Get videos assigned to the authenticated trainee
router.get('/my-assignments', authenticate, ctrl.getMyAssignedVideos);

// Get videos assigned to a specific trainee
router.get('/trainee/:traineeId', authenticate, instructorOrAdmin, ctrl.getTraineeVideos);

// Assign video to trainees
router.post('/:id/assign', authenticate, instructorOrAdmin, ctrl.assignToTrainees);

// Unassign a single trainee from a video
router.delete('/:id/assign/:traineeId', authenticate, instructorOrAdmin, ctrl.unassignTrainee);

// Delete a video
router.delete('/:id', authenticate, instructorOrAdmin, ctrl.deleteInstructorVideo);

module.exports = router;
