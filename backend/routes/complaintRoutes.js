const express = require('express');
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  updateStatus,
  updatePriority,
} = require('../controllers/complaintController');
const { protect, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

// Resident routes
router.post('/', requireRole('resident'), upload.single('photo'), createComplaint);
router.get('/mine', requireRole('resident'), getMyComplaints);

// Admin routes
router.get('/', requireRole('admin'), getAllComplaints);
router.patch('/:id/status', requireRole('admin'), updateStatus);
router.patch('/:id/priority', requireRole('admin'), updatePriority);

// Shared (ownership checked inside the controller)
router.get('/:id', getComplaintById);

module.exports = router;